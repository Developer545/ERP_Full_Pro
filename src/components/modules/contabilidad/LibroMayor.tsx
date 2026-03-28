"use client";

import { useState } from "react";
import {
  Card, DatePicker, Button, Table, Typography, Space, Row, Col,
  Statistic, Select, Alert,
} from "antd";
import { SearchOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useCuentas } from "@/hooks/queries/use-cuentas";
import { usePeriodos } from "@/hooks/queries/use-periodos";
import { useLibroMayor } from "@/hooks/queries/use-reportes-contabilidad";
import { PageHeader } from "@/components/ui/PageHeader";

const { Text } = Typography;

type Movimiento = {
  fecha: string;
  numero: number;
  concepto: string;
  descripcion: string | null;
  debe: number;
  haber: number;
  saldoAcumulado: number;
};

export function LibroMayor() {
  const ahora = dayjs();
  const [accountId, setAccountId] = useState<string>("");
  const [modo, setModo] = useState<"periodo" | "fechas">("fechas");
  const [periodoId, setPeriodoId] = useState<string | undefined>();
  const [desde, setDesde] = useState(ahora.startOf("month").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(ahora.format("YYYY-MM-DD"));
  const [query, setQuery] = useState<{ accountId: string; periodoId?: string; desde?: string; hasta?: string }>({ accountId: "" });
  const [consultado, setConsultado] = useState(false);

  const { data: cuentasData } = useCuentas({ soloMovimiento: true, pageSize: 500 });
  const cuentas: Array<{ id: string; codigo: string; nombre: string }> = cuentasData?.data ?? [];

  const { data: periodosData } = usePeriodos({ pageSize: 100 });
  const periodos: Array<{ id: string; nombre: string }> = periodosData?.data ?? [];

  const { data, isLoading } = useLibroMayor(query, consultado && !!query.accountId);

  const resultado = data?.data;
  const movimientos: Movimiento[] = resultado?.movimientos ?? [];

  const handleConsultar = () => {
    if (!accountId) return;
    setQuery({
      accountId,
      ...(modo === "periodo" ? { periodoId } : { desde, hasta }),
    });
    setConsultado(true);
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      width: 110,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    { title: "N° Asiento", dataIndex: "numero", key: "numero", width: 100, align: "center" as const },
    { title: "Concepto", dataIndex: "concepto", key: "concepto" },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion", render: (v: string | null) => v ?? "—" },
    {
      title: "Debe",
      dataIndex: "debe",
      key: "debe",
      width: 130,
      align: "right" as const,
      render: (v: number) => v > 0 ? <Text style={{ color: "#1677ff" }}>${v.toFixed(2)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Haber",
      dataIndex: "haber",
      key: "haber",
      width: 130,
      align: "right" as const,
      render: (v: number) => v > 0 ? <Text style={{ color: "#52c41a" }}>${v.toFixed(2)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Saldo",
      dataIndex: "saldoAcumulado",
      key: "saldoAcumulado",
      width: 140,
      align: "right" as const,
      render: (v: number) => (
        <Text style={{ fontWeight: 600, color: v >= 0 ? "#1677ff" : "#ff4d4f" }}>
          ${Math.abs(v).toFixed(2)} {v < 0 ? "(Acreedor)" : ""}
        </Text>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Libro Mayor" />

      <Card size="small" bordered={false} style={{ borderRadius: 10, marginBottom: 16 }}>
        <Space wrap>
          <Select
            showSearch
            placeholder="Seleccionar cuenta"
            style={{ width: 320 }}
            value={accountId || undefined}
            onChange={setAccountId}
            filterOption={(input, opt) =>
              (opt?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={cuentas.map((c) => ({
              value: c.id,
              label: `${c.codigo} — ${c.nombre}`,
            }))}
          />
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
              placeholder="Período"
              style={{ width: 200 }}
              value={periodoId}
              onChange={setPeriodoId}
              options={periodos.map((p) => ({ value: p.id, label: p.nombre }))}
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
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleConsultar}
            loading={isLoading}
            disabled={!accountId}
          >
            Consultar
          </Button>
          {movimientos.length > 0 && (
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Imprimir</Button>
          )}
        </Space>
      </Card>

      {consultado && resultado && (
        <>
          <Alert
            message={`${resultado.cuenta.codigo} — ${resultado.cuenta.nombre} | Tipo: ${resultado.cuenta.tipo} | Naturaleza: ${resultado.cuenta.naturaleza}`}
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
          />
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Saldo Anterior" value={Math.abs(resultado.saldoAnterior)} prefix="$" precision={2} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Total Debe" value={resultado.totalDebe} prefix="$" precision={2} valueStyle={{ color: "#1677ff" }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
                <Statistic title="Total Haber" value={resultado.totalHaber} prefix="$" precision={2} valueStyle={{ color: "#52c41a" }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: "#f6f6ff" }}>
                <Statistic
                  title="Saldo Final"
                  value={Math.abs(resultado.saldoFinal)}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: resultado.saldoFinal >= 0 ? "#1677ff" : "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Card size="small" bordered={false} style={{ borderRadius: 10 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={movimientos}
          rowKey={(_, i) => String(i)}
          loading={isLoading}
          pagination={{ pageSize: 100 }}
          summary={
            movimientos.length > 0
              ? () => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ fontWeight: "bold" }}>
                      <Table.Summary.Cell index={0} colSpan={4}>TOTALES</Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <Text style={{ color: "#1677ff" }}>${(resultado?.totalDebe ?? 0).toFixed(2)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <Text style={{ color: "#52c41a" }}>${(resultado?.totalHaber ?? 0).toFixed(2)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        <Text style={{ fontWeight: 600 }}>${Math.abs(resultado?.saldoFinal ?? 0).toFixed(2)}</Text>
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
