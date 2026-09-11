import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'guias' | 'expediciones' | 'seguridad';
  unlocked: boolean;
}

const BADGES_DATA: Badge[] = [
  {
    id: '1',
    title: 'Guía LNT (Leave No Trace)',
    description: 'Certificado en principios de No Dejar Rastro en montaña.',
    icon: '🌱',
    category: 'guias',
    unlocked: true,
  },
  {
    id: '2',
    title: 'Primeros Auxilios WFA',
    description: 'Wilderness First Aid actualizado para áreas remotas.',
    icon: '🩹',
    category: 'seguridad',
    unlocked: true,
  },
  {
    id: '3',
    title: 'Líder de Expedición',
    description: 'Más de 10 expediciones guiadas con éxito.',
    icon: '🥾',
    category: 'guias',
    unlocked: true,
  },
  {
    id: '4',
    title: 'Alta Montaña (+4000m)',
    description: 'Ascenso guiado a cumbres de más de 4,000 msnm.',
    icon: '🏔️',
    category: 'expediciones',
    unlocked: true,
  },
  {
    id: '5',
    title: 'Rescate e Inmovilización',
    description: 'Capacitación en evacuación y camillaje improvisado.',
    icon: '🚑',
    category: 'seguridad',
    unlocked: false,
  },
  {
    id: '6',
    title: 'Navegación Nocturna & GPS',
    description: 'Dominio de orientación con mapa, brújula y GPX sin luz.',
    icon: '🌌',
    category: 'expediciones',
    unlocked: false,
  },
];

export default function InsigniasScreen() {
  const [filter, setFilter] = useState<'todas' | 'guias' | 'seguridad'>('todas');

  const filteredBadges = BADGES_DATA.filter((badge) => {
    if (filter === 'todas') return true;
    return badge.category === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>🎖️ Reconocimiento & Insignias</Text>
          <Text style={styles.subtitle}>
            Certificaciones, rangos de guía y capacidades técnicas del equipo.
          </Text>
        </View>

        {/* Filtros rápidos */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'todas' && styles.filterBtnActive]}
            onPress={() => setFilter('todas')}>
            <Text style={[styles.filterText, filter === 'todas' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'guias' && styles.filterBtnActive]}
            onPress={() => setFilter('guias')}>
            <Text style={[styles.filterText, filter === 'guias' && styles.filterTextActive]}>
              Guías
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'seguridad' && styles.filterBtnActive]}
            onPress={() => setFilter('seguridad')}>
            <Text style={[styles.filterText, filter === 'seguridad' && styles.filterTextActive]}>
              Seguridad
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Insignias */}
        <View style={styles.badgeList}>
          {filteredBadges.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                !badge.unlocked && styles.badgeCardLocked,
              ]}>
              <View style={styles.iconContainer}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.cardHeader}>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={badge.unlocked ? styles.statusUnlocked : styles.statusLocked}>
                    {badge.unlocked ? 'Obtenida' : 'Pendiente'}
                  </Text>
                </View>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
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
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterBtnActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0F172A',
  },
  badgeList: {
    gap: 12,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.5,
    backgroundColor: '#0F172A',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  badgeIcon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  statusUnlocked: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: 'bold',
  },
  statusLocked: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: 'bold',
  },
});