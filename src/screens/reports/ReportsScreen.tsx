import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItemInfo } from 'react-native';
import { SalesRepositoryImpl } from '../../data/repositories/SalesRepositoryImpl';
import { InventoryRepositoryImpl } from '../../data/repositories/InventoryRepositoryImpl';
import { GetWeeklyReportUseCase, WeeklyProductSummary } from '../../domain/usecases/GetWeeklyReportUseCase';

const salesRepo = new SalesRepositoryImpl();
const inventoryRepo = new InventoryRepositoryImpl();
const weeklyReportUC = new GetWeeklyReportUseCase(salesRepo, inventoryRepo);

const ReportsScreen: React.FC = () => {
  const [total, setTotal] = useState(0);
  const [top, setTop] = useState<WeeklyProductSummary[]>([]);

  useEffect(() => {
    (async () => {
      const r = await weeklyReportUC.execute();
      setTotal(r.totalRevenue);
      setTop(r.products);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.metric}>Total da Semana: R$ {total.toFixed(2)}</Text>
      <Text style={styles.subtitle}>Top itens por receita</Text>
      <FlatList<WeeklyProductSummary>
        data={top}
        keyExtractor={(i: WeeklyProductSummary) => i.productId}
        renderItem={({ item }: ListRenderItemInfo<WeeklyProductSummary>) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.badge}>{item.quantitySold} un</Text>
            <Text style={styles.value}>R$ {item.revenue.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.placeholder}>Sem vendas na semana.</Text>}
      />
      <Text style={styles.footer}>Futuro: gráficos, itens mais vendidos por dia.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  metric: { fontSize: 16, marginBottom: 12 },
  subtitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 14, flex: 1 },
  badge: { fontSize: 12, color: '#555', width: 60, textAlign: 'right', marginRight: 8 },
  value: { fontWeight: '600', width: 100, textAlign: 'right' },
  placeholder: { fontSize: 12, color: '#555' },
  footer: { marginTop: 12, fontSize: 12, color: '#777' }
});

export default ReportsScreen;