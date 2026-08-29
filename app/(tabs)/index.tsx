import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>🏔️ Montaña App</Text>
      <Text style={styles.headerSubtitle}>Panel del Guía & Rutas</Text>

      {/* Tarjeta: Rutas de Senderismo */}
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => router.push('/rutas')}
      >
        <Text style={styles.cardEmoji}>🥾</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Rutas & Senderos</Text>
          <Text style={styles.cardDescription}>Explora mapas, elevaciones y niveles de dificultad.</Text>
        </View>
      </TouchableOpacity>

      {/* Tarjeta: Insignias de Guías (AHORA CONECTADA) */}
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => router.push('/insignias')}
      >
        <Text style={styles.cardEmoji}>🎖️</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Insignias de Guías</Text>
          <Text style={styles.cardDescription}>Gestión y reconocimiento para los guías del grupo.</Text>
        </View>
      </TouchableOpacity>

      {/* Tarjeta: Lista de Equipo */}
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Text style={styles.cardEmoji}>🎒</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Equipo & Checklist</Text>
          <Text style={styles.cardDescription}>Revisa el equipo necesario antes de cada expedición.</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#38BDF8',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#94A3B8',
  },
});