import { db } from './config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp, query, where, orderBy, Query, CollectionReference, writeBatch } from 'firebase/firestore';

export interface Bitacora {
  id: string;
  descripcion: string;
  duracion_horas: number;
  estado: string;
  fecha_inicio: string;
  fecha_resuelto: string;
  notas: string;
  prioridad: string;
  responsable: string;
  tipo: string;
}

export interface Log {
  id: string;
  referencia: string;
  timestamp: string;
  tipo_log: string;
  usuario: string;
}

export interface Equipo {
  id: string;
  estado: "activo" | "mantenimiento" | "no-activo";
  fecha_registro: string;
  modelo: string;
  "numero-serie": string;
  observaciones: string;
  ubicacion: string;
}

export interface FilterOptions {
  estado?: 'activo' | 'mantenimiento' | 'no-activo';
  orderBy?: 'asc' | 'desc';
  orderField?: string;
}

const COLLECTION_NAME = 'equipos';

class EquiposService {
  async checkPendingEvents(equipoId: string): Promise<boolean> {
    const bitacoraRef = collection(db, COLLECTION_NAME, equipoId, 'bitacora');
    const q = query(bitacoraRef, where('estado', 'in', ['abierto', 'en-proceso']));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Actualizar el estado del equipo basado en el tipo de evento
  async updateEquipoState(equipoId: string, newEventoState: string, eventoTipo: string): Promise<void> {
    let newEquipoState: "activo" | "mantenimiento" | "no-activo" = "activo";

    if (eventoTipo === "Incidente" && newEventoState !== "cerrado") {
      newEquipoState = "no-activo";
    } else if (eventoTipo === "Mantenimiento" && newEventoState === "en-proceso") {
      newEquipoState = "mantenimiento";
    } else if (newEventoState === "cerrado") {
      const hasPendingEvents = await this.checkPendingEvents(equipoId);
      newEquipoState = hasPendingEvents ? "no-activo" : "activo";
    }

    const docRef = doc(db, COLLECTION_NAME, equipoId);
    await updateDoc(docRef, { estado: newEquipoState });

    const logsRef = collection(db, COLLECTION_NAME, equipoId, 'logs');
    await addDoc(logsRef, {
      referencia: `Cambio de estado a ${newEquipoState}`,
      timestamp: serverTimestamp(),
      tipo_log: "cambio-estado",
      usuario: "Sistema"
    });
  }

  // Crear una entrada en la bitacora
  async createBitacoraEntry(equipoId: string, entrada: Omit<Bitacora, 'id'>): Promise<string> {
    const bitacoraRef = collection(db, COLLECTION_NAME, equipoId, 'bitacora');
    
    // Crear fecha de inicio como Timestamp
    const fechaInicio = serverTimestamp();
    
    const docRef = await addDoc(bitacoraRef, {
      ...entrada,
      fecha_inicio: fechaInicio,
      fecha_resuelto: null,
      duracion_horas: 0
    });

    const logsRef = collection(db, COLLECTION_NAME, equipoId, 'logs');
    await addDoc(logsRef, {
      referencia: entrada.descripcion,
      timestamp: serverTimestamp(),
      tipo_log: "registro-mantenimiento",
      usuario: entrada.responsable || "Sistema"
    });

    if (entrada.tipo === "Incidente") {
      await this.updateEquipoState(equipoId, entrada.estado, entrada.tipo);
    } else if (entrada.tipo === "Mantenimiento" && entrada.estado === "en-proceso") {
      await this.updateEquipoState(equipoId, entrada.estado, entrada.tipo);
    }

    return docRef.id;
  }

  // Obtener todos los equipos
  async getAll(filters?: FilterOptions): Promise<Equipo[]> {
    let q: Query | CollectionReference = collection(db, COLLECTION_NAME);
    
    const queryConstraints = [];
    
    if (filters?.estado) {
      queryConstraints.push(where('estado', '==', filters.estado));
    }
    
    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipo[];
  }

  // Obtener un equipo por ID
  async getById(id: string): Promise<Equipo | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Equipo;
  }

  // Crear un nuevo equipo
  async create(equipo: Omit<Equipo, 'id' | 'fecha_registro'>): Promise<string> {
    const fecha_registro = new Date().toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City'
    });
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...equipo,
      fecha_registro
    });
    
    return docRef.id;
  }

  // Actualizar un equipo
  async update(id: string, equipo: Partial<Omit<Equipo, 'id' | 'fecha_registro'>>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, equipo);
  }

  // Verificar si un equipo puede ser eliminado
  async canDelete(id: string): Promise<boolean> {
    const bitacoraRef = collection(db, COLLECTION_NAME, id, 'bitacora');
    const querySnapshot = await getDocs(bitacoraRef);
    return querySnapshot.empty;
  }

  // Eliminar un equipo
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const canBeDeleted = await this.canDelete(id);
    
    if (!canBeDeleted) {
      return {
        success: false,
        message: 'No se puede eliminar el equipo porque tiene registros en su bitácora'
      };
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return {
      success: true,
      message: 'Equipo eliminado exitosamente'
    };
  }

  // Obtener la bitácora de un equipo
  async getBitacora(equipoId: string, filters?: FilterOptions): Promise<Bitacora[]> {
    let q: Query | CollectionReference = collection(db, COLLECTION_NAME, equipoId, 'bitacora');

    const queryConstraints = [];
    
    if (filters?.orderBy && filters?.orderField) {
      queryConstraints.push(orderBy(filters.orderField, filters.orderBy));
    } else {
      queryConstraints.push(orderBy('fecha_inicio', 'desc'));
    }

    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        descripcion: data.descripcion || '',
        duracion_horas: data.duracion_horas || 0,
        estado: data.estado || 'abierto',
        fecha_inicio: data.fecha_inicio instanceof Timestamp 
          ? data.fecha_inicio.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
          : data.fecha_inicio || '',
        fecha_resuelto: data.fecha_resuelto instanceof Timestamp 
          ? data.fecha_resuelto.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
          : data.fecha_resuelto || '',
        notas: data.notas || '',
        prioridad: data.prioridad || 'baja',
        responsable: data.responsable || '',
        tipo: data.tipo || 'Incidente'
      } as Bitacora;
    });
  }

  // Actualizar una entrada de la bitácora
  async updateBitacoraEntry(equipoId: string, entradaId: string, updates: Partial<Bitacora>): Promise<void> {
    const entradaRef = doc(db, COLLECTION_NAME, equipoId, 'bitacora', entradaId);
    
    // Obtener la entrada actual para calcular las horas
    const entradaSnap = await getDoc(entradaRef);
    const entradaData = entradaSnap.data();
    
    // Si se está cerrando el evento, calcular las horas
    if (updates.estado === "cerrado" && entradaData) {
      const fechaInicio = entradaData.fecha_inicio instanceof Timestamp 
        ? entradaData.fecha_inicio.toDate()
        : new Date(entradaData.fecha_inicio);
      
      const fechaResuelto = new Date();
      
      // Calcular la diferencia en horas
      const diffHours = (fechaResuelto.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
      
      // Redondear a 2 decimales
      updates.duracion_horas = Math.round(diffHours * 100) / 100;
      updates.fecha_resuelto = fechaResuelto.toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City'
      });
    }

    await updateDoc(entradaRef, updates);
    
    if (entradaData && updates.estado) {
      await this.updateEquipoState(equipoId, updates.estado, entradaData.tipo);
    }

    // Crear log de actualización
    const logsRef = collection(db, COLLECTION_NAME, equipoId, 'logs');
    await addDoc(logsRef, {
      referencia: `Actualización de ${entradaData?.tipo}: ${
        updates.estado === "cerrado" 
          ? `cerrado con duración de ${updates.duracion_horas} horas` 
          : `cambio de estado a ${updates.estado}`
      }`,
      timestamp: serverTimestamp(),
      tipo_log: "actualizacion-evento",
      usuario: updates.responsable || "Sistema"
    });
  }

  // Obtener todos los logs de un equipo
  async getLogs(equipoId: string): Promise<Log[]> {
    const logsRef = collection(db, COLLECTION_NAME, equipoId, 'logs');
    const querySnapshot = await getDocs(logsRef);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        referencia: data.referencia || '',
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
          : data.timestamp || '',
        tipo_log: data.tipo_log || '',
        usuario: data.usuario || ''
      } as Log;
    });
  }

  //Obtener todos los eventos pendientes de atender
  async getPendingEvents(): Promise<Array<{ equipo: Equipo; eventos: Bitacora[] }>> {
    const equipos = await this.getAll();
    const results = [];

    for (const equipo of equipos) {
      const bitacoraRef = collection(db, COLLECTION_NAME, equipo.id, 'bitacora');
      const q = query(
        bitacoraRef,
        where('estado', 'in', ['abierto', 'en-proceso'])
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const eventos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha_inicio: doc.data().fecha_inicio instanceof Timestamp 
            ? doc.data().fecha_inicio.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
            : doc.data().fecha_inicio || '',
          fecha_resuelto: doc.data().fecha_resuelto instanceof Timestamp 
            ? doc.data().fecha_resuelto.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
            : doc.data().fecha_resuelto || ''
        })) as Bitacora[];

        results.push({
          equipo,
          eventos
        });
      }
    }

    return results;
  }

  async getEventsByMonth(month: number, year: number): Promise<Array<{ equipo: Equipo; eventos: Bitacora[] }>> {
    const equipos = await this.getAll();
    const results = [];

    // Crear fechas límite para el mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    for (const equipo of equipos) {
      const bitacoraRef = collection(db, COLLECTION_NAME, equipo.id, 'bitacora');
      const q = query(
        bitacoraRef,
        where('fecha_inicio', '>=', startDate),
        where('fecha_inicio', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const eventos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha_inicio: doc.data().fecha_inicio instanceof Timestamp 
            ? doc.data().fecha_inicio.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
            : doc.data().fecha_inicio || '',
          fecha_resuelto: doc.data().fecha_resuelto instanceof Timestamp 
            ? doc.data().fecha_resuelto.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
            : doc.data().fecha_resuelto || ''
        })) as Bitacora[];

        results.push({
          equipo,
          eventos
        });
      }
    }

    return results;
  }

  async closeAllEvents(equipoId: string, responsable: string): Promise<{ success: boolean; message: string }> {
    try {
      const bitacoraRef = collection(db, COLLECTION_NAME, equipoId, 'bitacora');
      const q = query(
        bitacoraRef,
        where('estado', 'in', ['abierto', 'en-proceso'])
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: true,
          message: 'No hay eventos pendientes para cerrar'
        };
      }

      const batch = writeBatch(db);
      const now = new Date();
      let eventosCount = 0;

      for (const doc of querySnapshot.docs) {
        const eventoData = doc.data();
        const fechaInicio = eventoData.fecha_inicio instanceof Timestamp 
          ? eventoData.fecha_inicio.toDate()
          : new Date(eventoData.fecha_inicio);
        
        // Calcular la diferencia en horas
        const diffHours = (now.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
        
        batch.update(doc.ref, {
          estado: 'cerrado',
          fecha_resuelto: now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
          duracion_horas: Math.round(diffHours * 100) / 100
        });

        eventosCount++;
      }

      // Crear un log de la operación
      const logsRef = collection(db, COLLECTION_NAME, equipoId, 'logs');
      batch.set(doc(logsRef), {
        referencia: `Cierre masivo de ${eventosCount} eventos pendientes`,
        timestamp: serverTimestamp(),
        tipo_log: "cierre-masivo",
        usuario: responsable
      });

      // Actualizar el estado del equipo a activo
      const equipoRef = doc(db, COLLECTION_NAME, equipoId);
      batch.update(equipoRef, {
        estado: 'activo'
      });

      await batch.commit();

      return {
        success: true,
        message: `Se cerraron ${eventosCount} eventos pendientes exitosamente`
      };
    } catch (error) {
      console.error('Error closing all events:', error);
      return {
        success: false,
        message: 'Error al cerrar los eventos pendientes'
      };
    }
  }
}

export const equiposService = new EquiposService();
