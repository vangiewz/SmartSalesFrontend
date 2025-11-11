// src/utils/syncQueue.ts
import { addToQueue, getAllQueueItems, deleteQueueItem, updateQueueItemRetries } from '../lib/db';
import { api } from '../lib/client';
import toast from 'react-hot-toast';

const MAX_RETRIES = 3;

/**
 * Procesa todos los items pendientes en la cola de sincronización
 * Se ejecuta automáticamente cuando se detecta conexión a internet
 */
export async function processSyncQueue() {
  if (!navigator.onLine) {
    console.log('📡 Sin conexión, no se puede procesar cola');
    return;
  }

  const queue = await getAllQueueItems();
  
  if (queue.length === 0) {
    console.log('✅ Cola de sincronización vacía');
    return;
  }

  // 🧹 Limpiar items con métodos incorrectos (PUT debería ser PATCH)
  const invalidItems: string[] = [];
  
  for (const item of queue) {
    // Si es update pero usa PUT en lugar de PATCH, eliminarlo
    if (item.action === 'update' && item.method === 'PUT') {
      console.warn('⚠️ Item con método incorrecto (PUT → PATCH):', item.id);
      invalidItems.push(item.id);
    }
  }
  
  // Eliminar items inválidos
  for (const id of invalidItems) {
    await deleteQueueItem(id);
  }

  // 🗑️ Limpiar items duplicados (mismo endpoint y action)
  const cleanQueue = await getAllQueueItems();
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  for (const item of cleanQueue) {
    const key = `${item.endpoint}-${item.action}`;
    if (seen.has(key)) {
      console.warn('⚠️ Item duplicado detectado:', key);
      duplicates.push(item.id);
    } else {
      seen.add(key);
    }
  }
  
  // Eliminar duplicados
  for (const id of duplicates) {
    await deleteQueueItem(id);
  }
  
  // Obtener cola final limpia
  const finalQueue = await getAllQueueItems();

  console.log(`📤 Procesando ${finalQueue.length} items de la cola...`);
  
  let successCount = 0;
  let failCount = 0;

  for (const item of finalQueue) {
    try {
      console.log(`🔄 Sincronizando ${item.type} (${item.action})...`);
      
      // 🔄 Preparar datos según el tipo
      let requestData = item.data;
      let headers: Record<string, string> = {};
      
      // Si es un producto, convertir a FormData
      if (item.type === 'producto' && (item.action === 'create' || item.action === 'update')) {
        const formData = new FormData();
        
        // Agregar campos del producto
        if (item.data.nombre) formData.append('nombre', item.data.nombre);
        if (item.data.precio !== undefined) formData.append('precio', item.data.precio.toString());
        if (item.data.stock !== undefined) formData.append('stock', item.data.stock.toString());
        if (item.data.tiempogarantia !== undefined) formData.append('tiempogarantia', item.data.tiempogarantia.toString());
        if (item.data.marca_id) formData.append('marca_id', item.data.marca_id.toString());
        if (item.data.tipoproducto_id) formData.append('tipoproducto_id', item.data.tipoproducto_id.toString());
        
        // Convertir imagen base64 de vuelta a File
        if (item.data.imagen && typeof item.data.imagen === 'string' && item.data.imagen.startsWith('data:')) {
          const blob = base64ToBlob(item.data.imagen);
          const filename = item.data.imagen_filename || 'imagen.jpg';
          const file = new File([blob], filename, { type: blob.type });
          formData.append('imagen', file);
        }
        
        requestData = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
      }
      
      // Ejecutar la petición según el método
      let response;
      switch (item.method) {
        case 'POST':
          response = await api.post(item.endpoint, requestData, { headers });
          break;
        case 'PUT':
          response = await api.put(item.endpoint, requestData, { headers });
          break;
        case 'PATCH':
          response = await api.patch(item.endpoint, requestData, { headers }); // ✅ Agregar headers
          break;
        case 'DELETE':
          response = await api.delete(item.endpoint);
          break;
        default:
          throw new Error(`Método no soportado: ${item.method}`);
      }

      if (response.status >= 200 && response.status < 300) {
        // ✅ Éxito: eliminar de la cola
        await deleteQueueItem(item.id);
        successCount++;
        console.log(`✅ ${item.type} sincronizado exitosamente`);
      } else {
        // Error HTTP
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Error al sincronizar ${item.type}:`, error);
      
      // Incrementar contador de reintentos
      const newRetries = item.retries + 1;
      
      if (newRetries >= MAX_RETRIES) {
        // Máximo de reintentos alcanzado
        console.error(`❌ Máximo de reintentos alcanzado para item ${item.id}`);
        await deleteQueueItem(item.id);
        failCount++;
        
        toast.error(`No se pudo sincronizar ${item.type}. Intenta manualmente.`, {
          duration: 5000,
          icon: '❌'
        });
      } else {
        // Actualizar contador de reintentos
        await updateQueueItemRetries(item.id, newRetries);
      }
    }
  }

  // Notificar resultado
  if (successCount > 0) {
    toast.success(`✅ ${successCount} operación(es) sincronizada(s)`, {
      duration: 4000,
      icon: '🔄'
    });
  }
  
  if (failCount > 0) {
    toast.error(`❌ ${failCount} operación(es) fallaron`, {
      duration: 5000
    });
  }

  console.log(`📊 Sincronización completada: ${successCount} éxitos, ${failCount} fallos`);
}

/**
 * Función helper para agregar operaciones a la cola
 */
export async function addOperationToQueue(
  type: 'producto', // Solo productos
  action: 'create' | 'update' | 'delete',
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  data?: any
) {
  await addToQueue({
    type,
    action,
    endpoint,
    method,
    data: data || {}
  });
  
  console.log(`📥 Operación agregada a cola: ${type} - ${action}`);
  // ❌ Toast movido a los hooks específicos para evitar duplicados
}

/**
 * Intenta ejecutar sincronización al recuperar conexión
 */
export function setupSyncListeners() {
  // Escuchar cambios en la conectividad
  window.addEventListener('online', async () => {
    console.log('🌐 Conexión recuperada, procesando cola...');
    toast.loading('Sincronizando datos...', { id: 'sync-toast' });
    
    try {
      await processSyncQueue();
      toast.success('Sincronización completada', { id: 'sync-toast' });
    } catch (error) {
      console.error('Error al sincronizar:', error);
      toast.error('Error en la sincronización', { id: 'sync-toast' });
    }
  });

  window.addEventListener('offline', () => {
    console.log('📡 Conexión perdida, modo offline activado');
    toast('Modo offline activado', {
      icon: '📡',
      duration: 2000
    });
  });
}

/**
 * Convierte una imagen base64 a Blob
 */
function base64ToBlob(base64: string): Blob {
  // Extraer el tipo MIME y los datos
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  
  // Convertir a array de bytes
  const rawLength = raw.length;
  const uint8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uint8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uint8Array], { type: contentType });
}
