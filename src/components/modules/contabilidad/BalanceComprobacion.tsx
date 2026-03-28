"use client";

import { useState } from "react";
import {
  Card, DatePicker, Button, Table, Typography, Space, Row, Col,
  Statistic, Select, Alert, Tag,
} from "antd";
import { SearchOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { usePeriodos } from "@/hooks/queries/use-periodos";
import { useBalanceComprobacion } from "@/hooks/queries/use-reportes-contabilidad";
import { PageHeader } from "@/components/ui/PageHeader";

const { Text } = Typography;

type LineaBC = {
  codigo: string;
  nombre: string;
  tipo: string;
  naturaleza: string;
  debitos: number;
  creditos: number;
  saldoDeudor: number;
  saldoAcreedor: number;
};

const TIPO_COLOR: Record<string, string> = {
  ACTIVO: "blue", PASIVO: "red", CAPITAL: "purple", PATRIMONIO: "purple",
  INGRESO: "green", COSTO: "orange", GASTO: "volcano",
};

export function BalanceComprobacion() {
  const ahora = dayjs();
  const [modo, setModo] = useState<"periodo" | "fechas">("fechas");
  const [periodoId, setPeriodoId] = useState<string | undefined>();
  const [desde, setDesde] = useState(ahora.startOf("month").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(ahora.format("YYYY-MM-DD"));
  const [query, setQuery] = useState<Record<string, string | undefined>>({});
  const [consultado, setConsultado] = useState(false);

  const { data: periodosData } = usePeriodos({ pageSize: 100 });
  const periodos: Array<{ id: string; nombre: string; estado: string }> = periodosData?.data ?? [];

  const { data, isLoading } = useBalanceComprobacion(
    { periodoId: query.periodoId, desde: query.desde, hasta: query.hasta },
    consultado
  );

  const resultado = data?.data;
  const lineas: LineaBC[] = resultado?.lineas ?? [];
  const totales = resultado?.totales;
  const cuadra: boolean = resultado?.cuadra ?? false;

  const handleConsultar = () => {
    if (modo === "periodo") {
      setQuery({ periodoId });
    } else {
      setQuery({ desde, hasta });
    }
    setConsultado(true);
  };

  const columns = [
    { title: "Código", dataIndex: "codigo", key: "codigo", width: 120 },
    { title: "Cuenta", dataIndex: "nombre", key: "nombre" },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 100,
      render: (v: string) => <Tag color={TIPO_COLOR[v] ?? "default"}>{v}</Tag>,
    },
    {
      title: "Débitos",
      dataIndex: "debitos",
      key: "debitos",
      width: 130,
      align: "right" as const,
      render: (v: number) => <Text style={{ color: "#1677ff" }}>${v.toFixed(2)}</Text>,
    },
    {
      title: "Créditos",
      dataIndex: "creditos",
      key: "creditos",
      width: 130,
      align: "right" as const,
      render: (v: number) => <Text style={{ color: "#52c41a" }}>${v.toFixed(2)}</Text>,
    },
    {
      title: "Saldo Deudor",
      dataIndex: "saldoDeudor",
      key: "saldoDeudor",
      width: 130,
      align: "right" as const,
      render: (v: number) => v > 0 ? <Text>${v.toFixed(2)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Saldo Acreedor",
      dataIndex: "saldoAcreedor",
      key: "saldoAcreedor",
      width: 130,
      align: "right" as const,
      render: (v: number) => v > 0 ? <Text>${v.toFixed(2)}</Text> : <Text type="secondary">—</Text>,
    },
  ];

  return (
    <>
      <PageHeader title="Balance de Comprobación" />

      <Card size="small" bordered={false} style={{ borderRadius: 10, marginBottom: 16 }}>
        <Space wrap>
          <Select
            value={modo}
            onChange={setModo}
            style={{ width: 150 }}
            options={[
              { value: "fechas", label: "Por fechas" },
              { value: "periodo", label: "Por período" },
            ]}
          />
          {modo === "periodo" ? (
            <Select
              placeholder="Seleccionar período"
              style={{ width: 200 }}
              value={periodoId}
              onChange={setPeriodoId}
              options={periodos.map((p) => ({
                value: p.id,
                label: `${p.nombre} (${p.estado === "ABIERTO" ? "Abierto" : "Cerrado"})`,
              }))}
            />
          ) : (
            <DatePicker.RangePicker
              size="small"
              format="DD/MM/YYYY"
              value={[dayjs(desde), dayjs(hasta)]}
              onChange={(dates) => {
                if (dates) {
                  setDesde(dates[0]!.format("YYYY-MM-DD"));
                  setHasta(dates[1]!.format("YYYY-MM-DD"));
                }
              }}
            />
          )}
          <Button type="primary" icon={<SearchOutlined />} onClick={handleConsultar} loading={isLoading}>
            Generar
          </Button>
          {lineas.length > 0 && (
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Imprimir
            </Button>
          )}
        </Space>
      </Card>

      {consultado && !isLoading && lineas.length > 0 && (
        <>
          {cuadra ? (
            <Alert message="El balance cuadra correctamente: Débitos = Créditos" type="success" showIcon style={{ marginBottom: 12 }} />
          ) : (
            <Alert message="Advertencia: El balance no cuadra. Revisa los asientos." type="error" showIcon style={{ marginBottom: 12 }} />
          )}

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Total Débitos" value={totales?.totalDebitos ?? 0} prefix="$" precision={2} valueStyle={{ color: "#1677ff" }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Total Créditos" value={totales?.totalCreditos ?? 0} prefix="$" precision={2} valueStyle={{ color: "#52c41a" }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Saldos Deudores" value={totales?.totalSaldoDeudor ?? 0} prefix="$" precision={2} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Saldos Acreedores" value={totales?.totalSaldoAcreedor ?? 0} prefix="$" precision={2} />
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={lineas}
          rowKey="codigo"
          loading={isLoading}
          pagination={{ pageSize: 100, showSizeChanger: false }}
          summary={
            lineas.length > 0
              ? () => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ fontWeight: "bold" }}>
                      <Table.Summary.Cell index={0} colSpan={3}>TOTALES</Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text style={{ color: "#1677ff" }}>${(totales?.totalDebitos ?? 0).toFixed(2)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <Text style={{ color: "#52c41a" }}>${(totales?.totalCreditos ?? 0).toFixed(2)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        ${(totales?.totalSaldoDeudor ?? 0).toFixed(2)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        ${(totales?.totalSaldoAcreedor ?? 0).toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )
              : undefined
          }
        />
      </Card>
    </>
  );
}
