import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { styles, colors } from './pdfStyles';

const Field = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}:</Text>
    <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
  </View>
);

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('es-AR', { timeZone: 'UTC' })
    : 'N/A';

const ReagentDeliveryPdfDocument = ({ delivery, logoUrl }) => (
  <Document title={`Entrega de Reactivos — ${delivery.client_name}`}>
    <Page size="A4" style={styles.page}>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Entrega de Reactivos</Text>
          <Text style={styles.headerSubtitle}>
            Fecha: {formatDate(delivery.delivery_date)}
          </Text>
        </View>
        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
      </View>

      <View style={styles.sectionFull}>
        <Text style={styles.sectionTitle}>Información del Cliente</Text>
        <Field label="Cliente"          value={delivery.client_name} />
        <Field label="Fecha de Entrega" value={formatDate(delivery.delivery_date)} />
      </View>

      <View style={styles.sectionFull}>
        <Text style={styles.sectionTitle}>Ítems Entregados</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Reactivo</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Tamaño</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Cant.</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Estado</Text>
        </View>
        {(delivery.delivery_items || []).map((item, idx) => (
          <View key={idx} style={[styles.tableRow, item.is_pending && { backgroundColor: '#fefce8' }]}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{item.reagent_name}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.reagent_size}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, { flex: 2, color: item.is_pending ? colors.amber : colors.emerald }]}>
              {item.is_pending ? 'PENDIENTE' : 'Entregado'}
            </Text>
          </View>
        ))}
        {(delivery.delivery_items || []).filter(i => i.is_pending && i.pending_notes).map((item, idx) => (
          <View key={`note-${idx}`} style={{ marginTop: 4, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 8, color: colors.amber }}>
              • {item.reagent_name}: {item.pending_notes}
            </Text>
          </View>
        ))}
      </View>

      {delivery.notes ? (
        <View style={styles.sectionFull}>
          <Text style={styles.sectionTitle}>Notas Generales</Text>
          <Text style={{ fontSize: 9 }}>{delivery.notes}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: colors.slate400, paddingTop: 4 }}>
          <Text style={{ fontSize: 8, color: colors.slate400, textAlign: 'center' }}>Firma del Receptor</Text>
        </View>
        <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: colors.slate400, paddingTop: 4 }}>
          <Text style={{ fontSize: 8, color: colors.slate400, textAlign: 'center' }}>Firma del Técnico Dimma</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Servicio Técnico Dimma — Comprobante de Entrega generado el {new Date().toLocaleDateString('es-AR')}
      </Text>

    </Page>
  </Document>
);

export default ReagentDeliveryPdfDocument;
