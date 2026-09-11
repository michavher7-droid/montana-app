import { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ItemChecklist {
  id: string;
  nombre: string;
  completado: boolean;
}

interface Expedicion {
  id: string;
  nombre: string;
  items: ItemChecklist[];
}

export default function ChecklistScreen() {
  const [expediciones, setExpediciones] = useState<Expedicion[]>([
    {
      id: '1',
      nombre: 'Pico de Orizaba',
      items: [
        { id: '1', nombre: 'Crampones y Piolet', completado: false },
        { id: '2', nombre: 'Casco de montaña', completado: false },
        { id: '3', nombre: 'Chamarra de pluma / 3ra capa', completado: false },
      ],
    },
    {
      id: '2',
      nombre: 'Senderismo Media Montaña',
      items: [
        { id: '1', nombre: 'Botas de senderismo', completado: true },
        { id: '2', nombre: 'Agua 2L', completado: false },
      ],
    },
  ]);

  const [expedicionSeleccionada, setExpedicionSeleccionada] = useState<Expedicion | null>(null);
  const [nuevaExpedicion, setNuevaExpedicion] = useState('');
  const [nuevoItem, setNuevoItem] = useState('');

  // Crear una nueva Expedición / Montaña
  const agregarExpedicion = () => {
    if (!nuevaExpedicion.trim()) return;
    const nueva: Expedicion = {
      id: Date.now().toString(),
      nombre: nuevaExpedicion.trim(),
      items: [],
    };
    setExpediciones([...expediciones, nueva]);
    setNuevaExpedicion('');
  };

  // Eliminar una Expedición
  const eliminarExpedicion = (id: string) => {
    setExpediciones((prev) => prev.filter((exp) => exp.id !== id));
    if (expedicionSeleccionada?.id === id) {
      setExpedicionSeleccionada(null);
    }
  };

  // Agregar un ítem a la expedición actual
  const agregarItem = () => {
    if (!nuevoItem.trim() || !expedicionSeleccionada) return;

    const itemNuevo: ItemChecklist = {
      id: Date.now().toString(),
      nombre: nuevoItem.trim(),
      completado: false,
    };

    const expedicionesActualizadas = expediciones.map((exp) => {
      if (exp.id === expedicionSeleccionada.id) {
        return { ...exp, items: [...exp.items, itemNuevo] };
      }
      return exp;
    });

    setExpediciones(expedicionesActualizadas);
    setExpedicionSeleccionada({
      ...expedicionSeleccionada,
      items: [...expedicionSeleccionada.items, itemNuevo],
    });
    setNuevoItem('');
  };

  // Marcar/Desmarcar un ítem
  const alternarItem = (itemId: string) => {
    if (!expedicionSeleccionada) return;

    const itemsActualizados = expedicionSeleccionada.items.map((item) =>
      item.id === itemId ? { ...item, completado: !item.completado } : item
    );

    const expedicionesActualizadas = expediciones.map((exp) =>
      exp.id === expedicionSeleccionada.id ? { ...exp, items: itemsActualizados } : exp
    );

    setExpediciones(expedicionesActualizadas);
    setExpedicionSeleccionada({ ...expedicionSeleccionada, items: itemsActualizados });
  };

  // Eliminar un ítem de la expedición actual
  const eliminarItem = (itemId: string) => {
    if (!expedicionSeleccionada) return;

    const itemsFiltrados = expedicionSeleccionada.items.filter((item) => item.id !== itemId);

    const expedicionesActualizadas = expediciones.map((exp) =>
      exp.id === expedicionSeleccionada.id ? { ...exp, items: itemsFiltrados } : exp
    );

    setExpediciones(expedicionesActualizadas);
    setExpedicionSeleccionada({ ...expedicionSeleccionada, items: itemsFiltrados });
  };

  // VISTA 1: Lista de Expediciones/Montañas
  if (!expedicionSeleccionada) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <Text style={styles.titulo}>🏔️ Mis Expediciones</Text>

          {/* Formulario para añadir montaña */}
          <View style={styles.cardInput}>
            <TextInput
              style={styles.input}
              placeholder="Ej. Alta Montaña, Pico de Orizaba..."
              placeholderTextColor="#888"
              value={nuevaExpedicion}
              onChangeText={setNuevaExpedicion}
            />
            <TouchableOpacity style={styles.btnAgregar} onPress={agregarExpedicion}>
              <Text style={styles.btnAgregarTexto}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Tarjetas de Montañas */}
          <View style={styles.listaContainer}>
            {expediciones.map((exp) => {
              const completados = exp.items.filter((i) => i.completado).length;
              const progreso = exp.items.length > 0 ? Math.round((completados / exp.items.length) * 100) : 0;

              return (
                <TouchableOpacity
                  key={exp.id}
                  style={styles.cardExpedicion}
                  onPress={() => setExpedicionSeleccionada(exp)}
                >
                  <View style={styles.headerExpedicion}>
                    <Text style={styles.nombreExpedicion}>{exp.nombre}</Text>
                    <TouchableOpacity onPress={() => eliminarExpedicion(exp.id)}>
                      <Text style={styles.btnEliminar}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.detalleProgreso}>
                    {completados} de {exp.items.length} ítems listos ({progreso}%)
                  </Text>
                  <View style={styles.barraFondo}>
                    <View style={[styles.barraRelleno, { width: `${progreso}%` }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // VISTA 2: Detalle de Ítems de la Montaña Seleccionada
  const completados = expedicionSeleccionada.items.filter((i) => i.completado).length;
  const progreso =
    expedicionSeleccionada.items.length > 0
      ? Math.round((completados / expedicionSeleccionada.items.length) * 100)
      : 0;

  return (
  <SafeAreaView style={styles.container}>
    <ScrollView style={styles.scroll}>
      {/* Botón Volver con margen seguro */}
      <TouchableOpacity 
        style={styles.btnVolver} 
        onPress={() => setExpedicionSeleccionada(null)}
      >
        <Text style={styles.btnVolverTexto}>← Volver a Expediciones</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>🎒 {expedicionSeleccionada.nombre}</Text>

        {/* Barra de Progreso */}
        <View style={styles.cardProgreso}>
          <View style={styles.rowHeaderProgreso}>
            <Text style={styles.textoProgreso}>Progreso del Empaque</Text>
            <Text style={styles.porcentajeProgreso}>{progreso}%</Text>
          </View>
          <View style={styles.barraFondo}>
            <View style={[styles.barraRelleno, { width: `${progreso}%` }]} />
          </View>
          <Text style={styles.detalleProgreso}>
            {completados} de {expedicionSeleccionada.items.length} ítems listos
          </Text>
        </View>

        {/* Formulario para añadir artículo */}
        <View style={styles.cardInput}>
          <TextInput
            style={styles.input}
            placeholder="Agregar artículo..."
            placeholderTextColor="#888"
            value={nuevoItem}
            onChangeText={setNuevoItem}
          />
          <TouchableOpacity style={styles.btnAgregar} onPress={agregarItem}>
            <Text style={styles.btnAgregarTexto}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Checkbox */}
        <View style={styles.listaContainer}>
          {expedicionSeleccionada.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => alternarItem(item.id)}>
                <View style={[styles.checkbox, item.completado && styles.checkboxChecked]}>
                  {item.completado && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.itemTexto, item.completado && styles.itemTextoCompletado]}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarItem(item.id)}>
                <Text style={styles.btnEliminar}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
container: { 
    flex: 1, 
    backgroundColor: '#0f172a',
    // Agrega espacio seguro para la barra de estado de Android e iOS:
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
  },
  scroll: { 
    paddingHorizontal: 16,
  },
  btnVolver: {
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnVolverTexto: { 
    color: '#38bdf8', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  cardInput: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    height: 48,
  },
  btnAgregar: {
    backgroundColor: '#0284c7',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAgregarTexto: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  listaContainer: { gap: 12, marginBottom: 24 },
  cardExpedicion: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerExpedicion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombreExpedicion: { fontSize: 18, fontWeight: 'bold', color: '#38bdf8' },
  cardProgreso: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16 },
  rowHeaderProgreso: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  textoProgreso: { color: '#fff', fontWeight: 'bold' },
  porcentajeProgreso: { color: '#38bdf8', fontWeight: 'bold' },
  barraFondo: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  barraRelleno: { height: '100%', backgroundColor: '#22c55e' },
  detalleProgreso: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#38bdf8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#38bdf8' },
  checkmark: { color: '#0f172a', fontWeight: 'bold', fontSize: 14 },
  itemTexto: { color: '#fff', fontSize: 15 },
  itemTextoCompletado: { textDecorationLine: 'line-through', color: '#64748b' },
  btnEliminar: { color: '#ef4444', fontSize: 16, paddingHorizontal: 8 },
});