import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { styles, colors } from './pdfStyles';

const Field = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}:</Text>
    <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
  </View>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'Pendiente':   return '#f59e0b';
    case 'En Progreso': return '#0ea5e9';
    case 'Completada':  return '#10b981';
    case 'Facturado':   return '#16a34a';
    case 'Cancelada':   return '#ef4444';
    default:            return '#64748b';
  }
};

const formatCurrency = (value) =>
  `$${(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('es-AR', { timeZone: 'UTC' })
    : 'N/A';

const OrderPdfDocument = ({ order, logoUrl, showCosts = true }) => (
  <Document title={`Orden de Servicio ${order.id}`}>
    <Page size="A4" style={styles.page}>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Orden de Servicio: {order.id}</Text>
          <Text style={styles.headerSubtitle}>
            Generado el {new Date().toLocaleDateString('es-AR')}
          </Text>
        </View>
        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
      </View>

      <View style={styles.sectionRow}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <Field label="Cliente"     value={order.client_name} />
          <Field label="Laboratorio" value={order.sub_client_name} />
          <Field label="Dirección"   value={order.client_location} />
          <Field label="Contacto"    value={order.client_contact} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Equipo</Text>
          <Field label="Tipo"   value={order.equipment_type} />
          <Field label="Marca"  value={order.equipment_brand} />
          <Field label="Modelo" value={order.equipment_model} />
          <Field label="N/S"    value={order.equipment_serial} />
        </View>
      </View>

      <View style={styles.sectionFull}>
        <Text style={styles.sectionTitle}>Problema Reportado</Text>
        <Text style={{ fontSize: 9 }}>{order.reported_issue || 'No especificado.'}</Text>
      </View>

      {order.work_summary ? (
        <View style={styles.sectionFull}>
          <Text style={styles.sectionTitle}>Resumen del Trabajo Realizado</Text>
          <Text style={{ fontSize: 9 }}>{order.work_summary}</Text>
        </View>
      ) : null}

      {order.task_time > 0 ? (
        <View style={styles.sectionFull}>
          <Text style={styles.sectionTitle}>Tiempo de Tarea</Text>
          <Text style={{ fontSize: 9 }}>{order.task_time} horas</Text>
        </View>
      ) : null}

      <View style={styles.sectionFull}>
        <Text style={styles.sectionTitle}>Repuestos Utilizados</Text>
        {order.parts_used && order.parts_used.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Repuesto</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Cant.</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Total</Text>
            </View>
            {order.parts_used.map((part, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{part.partName || part.name}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{part.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  {formatCurrency(part.totalCost || part.totalPrice)}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={{ fontSize: 9, color: colors.slate400, fontStyle: 'italic' }}>
            No se utilizaron repuestos.
          </Text>
        )}
      </View>

      {showCosts && (
        <View style={styles.sectionFull}>
          <Text style={styles.sectionTitle}>Resumen de Costos</Text>
          <View style={styles.costsGrid}>
            <View style={styles.costBox}>
              <Text style={styles.costLabel}>Mano de Obra</Text>
              <Text style={styles.costValue}>{formatCurrency(order.labor_cost)}</Text>
            </View>
            <View style={styles.costBox}>
              <Text style={styles.costLabel}>Repuestos</Text>
              <Text style={styles.costValue}>{formatCurrency(order.parts_cost)}</Text>
            </View>
            <View style={styles.costBox}>
              <Text style={styles.costLabel}>Traslado</Text>
              <Text style={styles.costValue}>{formatCurrency(order.transport_cost)}</Text>
            </View>
            <View style={styles.costBoxTotal}>
              <Text style={[styles.costLabel, { color: colors.teal }]}>Costo Total</Text>
              <Text style={styles.costValueTotal}>{formatCurrency(order.total_cost)}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.sectionFull}>
        <Text style={styles.sectionTitle}>Otros Detalles</Text>
        <Field label="Técnico"          value={order.assigned_technician} />
        <Field label="Fecha Recepción"  value={formatDate(order.date_received)} />
        <Field label="Fecha Completado" value={formatDate(order.date_completed)} />
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Estado:</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={{ color: colors.white, fontSize: 8 }}>{order.status || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        Servicio Técnico Dimma — Reporte generado el {new Date().toLocaleDateString('es-AR')}
      </Text>

    </Page>
  </Document>
);

export default OrderPdfDocument;
