"use client";

import { useState, useCallback } from "react";
import {
  Row,
  Col,
  Input,
  Button,
  Card,
  Select,
  InputNumber,
  Modal,
  Tag,
  Spin,
  Typography,
  Space,
  Divider,
  Empty,
  Avatar,
  Tooltip,
  Alert,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  ReloadOutlined,
  UserOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { usePOSStore } from "@/stores/pos-store";
import { useProductosPOS, useProcessVenta } from "@/hooks/queries/use-pos";
import { useClientes } from "@/hooks/queries/use-clientes";
import { CURRENCY } from "@/config/constants";
import type { ProductoPOS, POSVentaResult } from "@/modules/pos/pos.types";

const { Text, Title } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${CURRENCY.SYMBOL}${n.toFixed(2)}`;

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Card de producto en el catalogo */
function ProductoCard({
  producto,
  onAdd,
}: {
  producto: ProductoPOS;
  onAdd: (p: ProductoPOS) => void;
}) {
  const sinStock = producto.trackStock && producto.stock <= 0;

  return (
    <Card
      size="small"
      hoverable={!sinStock}
      style={{
        borderRadius: 8,
        opacity: sinStock ? 0.5 : 1,
        cursor: sinStock ? "not-allowed" : "pointer",
        border: "1px solid #f0f0f0",
      }}
      styles={{ body: { padding: "10px 12px" } }}
      onClick={() => !sinStock && onAdd(producto)}
    >
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        {/* Icono o imagen */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {producto.image ? (
            <Avatar
              src={producto.image}
              shape="square"
              size={36}
              style={{ borderRadius: 6, flexShrink: 0 }}
            />
          ) : (
            <Avatar
              icon={<BarcodeOutlined />}
              shape="square"
              size={36}
              style={{ borderRadius: 6, background: "#f5f5f5", color: "#999", flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text strong style={{ fontSize: 12, display: "block" }} ellipsis>
              {producto.name}
            </Text>
            {producto.sku && (
              <Text type="secondary" style={{ fontSize: 10 }}>
                {producto.sku}
              </Text>
            )}
          </div>
        </div>

        {/* Precio y stock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text strong style={{ color: "#52c41a", fontSize: 14 }}>
            {fmt(Number(producto.price))}
          </Text>
          {producto.trackStock && (
            <Tag
              color={producto.stock > 5 ? "green" : producto.stock > 0 ? "orange" : "red"}
              style={{ margin: 0, fontSize: 10 }}
            >
              {sinStock ? "Sin stock" : `${Number(producto.stock)} ${producto.unit}`}
            </Tag>
          )}
        </div>
      </Space>
    </Card>
  );
}

/** Modal de ticket de venta exitosa */
function TicketModal({
  open,
  result,
  onNuevaVenta,
}: {
  open: boolean;
  result: POSVentaResult | null;
  onNuevaVenta: () => void;
}) {
  if (!result) return null;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
          <span>Venta procesada exitosamente</span>
        </Space>
      }
      footer={null}
      closable={false}
      width={380}
      centered
    >
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <CheckCircleOutlined style={{ fontSize: 56, color: "#52c41a", marginBottom: 12 }} />

        <Title level={4} style={{ marginBottom: 4 }}>
          {result.invoice.tipoDoc} #{result.invoice.correlativo}
        </Title>

        <Title level={3} style={{ color: "#52c41a", marginBottom: 16 }}>
          Total: {fmt(result.invoice.total)}
        </Title>

        {result.change > 0 && (
          <Alert
            type="success"
            message={
              <Text strong style={{ fontSize: 16 }}>
                Vuelto al cliente: {fmt(result.change)}
              </Text>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<PrinterOutlined />}
            block
            onClick={() => window.print()}
          >
            Imprimir Ticket
          </Button>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            block
            size="large"
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
            onClick={onNuevaVenta}
          >
            Nueva Venta
          </Button>
        </Space>
      </div>
    </Modal>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * POSClient — Pantalla completa del Punto de Venta.
 *
 * Layout de 2 columnas:
 * - Izquierda (60%): catalogo de productos + buscador
 * - Derecha (40%): carrito + totales + cobro
 */
export function POSClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ventaResult, setVentaResult] = useState<POSVentaResult | null>(null);

  // ── Store del carrito ──
  const {
    items,
    customerId,
    tipoDoc,
    paymentMethod,
    amountReceived,
    notes,
    subtotal,
    ivaTotal,
    total,
    change,
    isProcessing,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    setCustomer,
    setTipoDoc,
    setPaymentMethod,
    setAmountReceived,
    setNotes,
    clearCart,
    setProcessing,
  } = usePOSStore();

  // ── Data hooks ──
  const { data: productosData, isLoading: loadingProductos } = useProductosPOS(searchQuery);
  // Buscar solo clientes activos; isActive se serializa como string al enviarse via URLSearchParams
  const { data: clientesData, isLoading: loadingClientes } = useClientes({
    search: clienteSearch,
    pageSize: 20,
  });
  const procesarVentaMutation = useProcessVenta();

  const productos: ProductoPOS[] = productosData ?? [];
  const clientes = clientesData?.data ?? [];

  // ── Handlers ──

  const handleAddItem = useCallback(
    (product: ProductoPOS) => {
      addItem(product);
    },
    [addItem]
  );

  const handleCobrar = () => {
    if (items.length === 0) return;
    setConfirmOpen(true);
  };

  const handleConfirmarVenta = () => {
    if (items.length === 0) return;
    setProcessing(true);
    setConfirmOpen(false);

    procesarVentaMutation.mutate(
      {
        customerId: customerId ?? undefined,
        tipoDoc,
        items,
        paymentMethod,
        amountReceived: paymentMethod === "CASH" ? amountReceived : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: (result) => {
          setProcessing(false);
          setVentaResult(result);
          setTicketOpen(true);
          toast.success(`Venta ${result.invoice.tipoDoc} #${result.invoice.correlativo} procesada`);
        },
        onError: (error) => {
          setProcessing(false);
          toast.error(error.message || "Error al procesar la venta");
        },
      }
    );
  };

  const handleNuevaVenta = () => {
    setTicketOpen(false);
    setVentaResult(null);
    clearCart();
    setSearchQuery("");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* Header del POS */}
      <div
        style={{
          background: "#001529",
          padding: "12px 20px",
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <ShoppingCartOutlined style={{ color: "#52c41a", fontSize: 20 }} />
          <Text strong style={{ color: "#fff", fontSize: 16 }}>
            Punto de Venta
          </Text>
        </Space>
        <Tag color="green" style={{ fontSize: 12 }}>
          POS Activo
        </Tag>
      </div>

      {/* Layout principal: 2 columnas */}
      <Row style={{ flex: 1, overflow: "hidden" }} gutter={0}>
        {/* ── COLUMNA IZQUIERDA: Catalogo (60%) ── */}
        <Col
          span={15}
          style={{
            borderRight: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            background: "#fafafa",
          }}
        >
          {/* Buscador de productos */}
          <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
            <Input
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Buscar por nombre, SKU o codigo de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="large"
              allowClear
              autoFocus
            />
          </div>

          {/* Grid de productos */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {loadingProductos ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                <Spin tip="Cargando productos..." />
              </div>
            ) : productos.length === 0 ? (
              <Empty
                description={
                  searchQuery
                    ? `Sin resultados para "${searchQuery}"`
                    : "No hay productos disponibles"
                }
                style={{ paddingTop: 60 }}
              />
            ) : (
              <Row gutter={[10, 10]}>
                {productos.map((producto) => (
                  <Col key={producto.id} xs={12} sm={8} lg={6}>
                    <ProductoCard producto={producto} onAdd={handleAddItem} />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Col>

        {/* ── COLUMNA DERECHA: Carrito (40%) ── */}
        <Col
          span={9}
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          {/* Lista de items del carrito */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            <Text strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
              <ShoppingCartOutlined /> Carrito ({items.length} items)
            </Text>

            {items.length === 0 ? (
              <Empty
                description="Carrito vacio"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ paddingTop: 40 }}
              />
            ) : (
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                {items.map((item) => (
                  <Card
                    key={item.productId}
                    size="small"
                    style={{ borderRadius: 8 }}
                    styles={{ body: { padding: "8px 12px" } }}
                  >
                    {/* Nombre + boton eliminar */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <Text strong style={{ fontSize: 12, flex: 1, marginRight: 8 }} ellipsis>
                        {item.name}
                      </Text>
                      <Tooltip title="Eliminar">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeItem(item.productId)}
                          style={{ padding: "0 4px" }}
                        />
                      </Tooltip>
                    </div>

                    {/* Controles de cantidad + precio unitario */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{ padding: "0 6px", minWidth: 28 }}
                      />
                      <InputNumber
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={(v) => v && updateQuantity(item.productId, v)}
                        style={{ width: 56, textAlign: "center" }}
                        controls={false}
                      />
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{ padding: "0 6px", minWidth: 28 }}
                      />
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                        × {fmt(item.unitPrice)}
                      </Text>
                    </div>

                    {/* Descuento + subtotal */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Desc:
                        </Text>
                        <InputNumber
                          size="small"
                          min={0}
                          max={100}
                          value={item.discount}
                          onChange={(v) => updateDiscount(item.productId, v ?? 0)}
                          formatter={(v) => `${v}%`}
                          parser={(v) => parseFloat(v?.replace("%", "") ?? "0") as never}
                          style={{ width: 64 }}
                          controls={false}
                        />
                      </Space>
                      <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
                        {fmt(item.total)}
                      </Text>
                    </div>
                  </Card>
                ))}
              </Space>
            )}
          </div>

          {/* ── Panel de totales y cobro ── */}
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              padding: "12px 16px",
              background: "#fafafa",
            }}
          >
            {/* Totales */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Subtotal (sin IVA):
                </Text>
                <Text style={{ fontSize: 12 }}>{fmt(subtotal)}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  IVA (13%):
                </Text>
                <Text style={{ fontSize: 12 }}>{fmt(ivaTotal)}</Text>
              </div>
              <Divider style={{ margin: "6px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 16 }}>
                  TOTAL:
                </Text>
                <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                  {fmt(total)}
                </Text>
              </div>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {/* Tipo de documento */}
            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Tipo de documento:
              </Text>
              <Select
                value={tipoDoc}
                onChange={setTipoDoc}
                style={{ width: "100%" }}
                size="small"
                options={[
                  { value: "CF", label: "CF — Consumidor Final" },
                  { value: "CCF", label: "CCF — Credito Fiscal" },
                ]}
              />
            </div>

            {/* Seleccion de cliente */}
            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Cliente{tipoDoc === "CCF" ? " *" : " (opcional)"}:
              </Text>
              <Select
                value={customerId ?? undefined}
                onChange={(v) => setCustomer(v ?? null)}
                showSearch
                allowClear={tipoDoc === "CF"}
                onSearch={setClienteSearch}
                filterOption={false}
                loading={loadingClientes}
                placeholder={
                  <span>
                    <UserOutlined /> Buscar cliente...
                  </span>
                }
                style={{ width: "100%" }}
                size="small"
                notFoundContent={
                  loadingClientes ? <Spin size="small" /> : "Sin resultados"
                }
                options={clientes.map((c: { id: string; name: string; docNumber?: string | null }) => ({
                  value: c.id,
                  label: `${c.name}${c.docNumber ? ` — ${c.docNumber}` : ""}`,
                }))}
              />
            </div>

            {/* Metodo de pago */}
            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Metodo de pago:
              </Text>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                style={{ width: "100%" }}
                size="small"
                options={[
                  { value: "CASH", label: "Efectivo" },
                  { value: "CARD", label: "Tarjeta" },
                  { value: "TRANSFER", label: "Transferencia" },
                ]}
              />
            </div>

            {/* Efectivo recibido y vuelto */}
            {paymentMethod === "CASH" && (
              <div style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                  Efectivo recibido:
                </Text>
                <InputNumber
                  value={amountReceived}
                  onChange={(v) => setAmountReceived(v ?? 0)}
                  min={0}
                  precision={2}
                  prefix="$"
                  style={{ width: "100%" }}
                  size="small"
                />
                {change > 0 && (
                  <Alert
                    type="success"
                    message={
                      <Text strong style={{ fontSize: 13 }}>
                        Vuelto: {fmt(change)}
                      </Text>
                    }
                    style={{ marginTop: 6, padding: "4px 10px" }}
                  />
                )}
                {amountReceived > 0 && amountReceived < total && (
                  <Alert
                    type="warning"
                    message={
                      <Text style={{ fontSize: 11 }}>
                        Falta: {fmt(total - amountReceived)}
                      </Text>
                    }
                    style={{ marginTop: 6, padding: "4px 10px" }}
                  />
                )}
              </div>
            )}

            {/* Notas */}
            <div style={{ marginBottom: 12 }}>
              <Input.TextArea
                placeholder="Notas (opcional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={1}
                style={{ fontSize: 12 }}
                maxLength={200}
              />
            </div>

            {/* Boton COBRAR */}
            <Button
              type="primary"
              block
              size="large"
              disabled={
                items.length === 0 ||
                isProcessing ||
                (tipoDoc === "CCF" && !customerId) ||
                (paymentMethod === "CASH" && amountReceived < total)
              }
              loading={isProcessing}
              onClick={handleCobrar}
              style={{
                height: 52,
                fontSize: 18,
                fontWeight: 700,
                background: items.length > 0 ? "#52c41a" : undefined,
                borderColor: items.length > 0 ? "#52c41a" : undefined,
                borderRadius: 8,
              }}
              icon={<ShoppingCartOutlined />}
            >
              COBRAR {total > 0 ? fmt(total) : ""}
            </Button>
          </div>
        </Col>
      </Row>

      {/* ── Modal de confirmacion ── */}
      <Modal
        title="Confirmar Venta"
        open={confirmOpen}
        onOk={handleConfirmarVenta}
        onCancel={() => setConfirmOpen(false)}
        okText="Confirmar y Cobrar"
        cancelText="Cancelar"
        okButtonProps={{
          style: { background: "#52c41a", borderColor: "#52c41a" },
          size: "large",
        }}
        confirmLoading={isProcessing}
        centered
        width={380}
      >
        <div style={{ padding: "8px 0" }}>
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary">Tipo:</Text>
              <Tag color={tipoDoc === "CCF" ? "blue" : "default"}>{tipoDoc}</Tag>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary">Productos:</Text>
              <Text strong>{items.length} items</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary">Subtotal:</Text>
              <Text>{fmt(subtotal)}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary">IVA:</Text>
              <Text>{fmt(ivaTotal)}</Text>
            </div>
            <Divider style={{ margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong style={{ fontSize: 16 }}>
                TOTAL:
              </Text>
              <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                {fmt(total)}
              </Text>
            </div>
            {paymentMethod === "CASH" && change > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Vuelto:</Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {fmt(change)}
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Modal>

      {/* ── Modal de ticket exitoso ── */}
      <TicketModal
        open={ticketOpen}
        result={ventaResult}
        onNuevaVenta={handleNuevaVenta}
      />
    </div>
  );
}
