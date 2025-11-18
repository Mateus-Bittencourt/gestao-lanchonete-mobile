import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItemInfo, TextInput, Button, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { SalesRepositoryImpl } from '../../data/repositories/SalesRepositoryImpl';
import { InventoryRepositoryImpl } from '../../data/repositories/InventoryRepositoryImpl';
import { GetWeeklyReportUseCase, WeeklyProductSummary } from '../../domain/usecases/GetWeeklyReportUseCase';

const salesRepo = new SalesRepositoryImpl();
const inventoryRepo = new InventoryRepositoryImpl();
const weeklyReportUC = new GetWeeklyReportUseCase(salesRepo, inventoryRepo);

const ReportsScreen: React.FC = () => {
  const [total, setTotal] = useState(0);
  const [top, setTop] = useState<WeeklyProductSummary[]>([]);
  const [from, setFrom] = useState(''); // yyyy-mm-dd
  const [to, setTo] = useState('');     // yyyy-mm-dd

  async function refresh() {
    const parse = (v: string) => v ? new Date(v).getTime() : undefined;
    const range = (from || to) ? { from: parse(from) ?? Date.now() - 7*24*60*60*1000, to: parse(to) ?? Date.now() } : undefined;
    const r = await weeklyReportUC.execute(range as any);
    setTotal(r.totalRevenue);
    setTop(r.products);
  }

  useEffect(() => { refresh(); }, []);

  function buildCSV(rows: string[][]): string {
    return rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function exportCSV() {
    const header = ['Produto', 'Quantidade', 'Receita'];
    const rows = top.map(i => [i.name, String(i.quantitySold), i.revenue.toFixed(2)]);
    const csv = buildCSV([header, ...rows]);
    const path = `${RNFS.CachesDirectoryPath}/relatorio.csv`;
    RNFS.writeFile(path, csv, 'utf8')
      .then(() => Share.open({ url: 'file://' + path, type: 'text/csv', failOnCancel: false }))
      .catch((e) => Alert.alert('Erro', e?.message ?? 'Falha ao exportar CSV'));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.metric}>Total: R$ {total.toFixed(2)}</Text>

      <View style={styles.filterRow}>
        <TextInput placeholder="De (YYYY-MM-DD)" value={from} onChangeText={setFrom} style={styles.input} />
        <TextInput placeholder="Até (YYYY-MM-DD)" value={to} onChangeText={setTo} style={styles.input} />
        <Button title="Filtrar" onPress={refresh} />
      </View>
      <Button title="Exportar CSV" onPress={exportCSV} />

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
        ListEmptyComponent={<Text style={styles.placeholder}>Sem vendas no período.</Text>}
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
  footer: { marginTop: 12, fontSize: 12, color: '#777' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  input: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 }
});

export default ReportsScreen;