import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SalesRepositoryImpl } from '../../data/repositories/SalesRepositoryImpl';

const salesRepo = new SalesRepositoryImpl();

const ReportsScreen: React.FC = () => {
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const wt = await salesRepo.getWeeklyTotal();
      setWeeklyTotal(wt);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.metric}>Total da Semana: R$ {weeklyTotal.toFixed(2)}</Text>
      <Text style={styles.placeholder}(Futuro: gráficos, itens mais vendidos, desempenho por dia.)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  metric: { fontSize: 16, marginBottom: 8 },
  placeholder: { fontSize: 12, color: '#555' }
});

export default ReportsScreen;