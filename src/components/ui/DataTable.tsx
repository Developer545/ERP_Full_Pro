"use client";

import { useState, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tooltip,
  Typography,
  Row,
  Col,
} from "antd";
import type { TableProps, TableColumnType } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/config/constants";

const { Text } = Typography;

export type DataTableColumn<T> = TableColumnType<T>;

interface DataTableProps<T extends object> {
  /** Columnas de la tabla */
  columns: DataTableColumn<T>[];
  /** Datos */
  dataSource: T[];
  /** Clave unica por fila */
  rowKey: keyof T | ((row: T) => string);
  /** Total de registros (para paginacion server-side) */
  total?: number;
  /** Pagina actual (paginacion server-side) */
  page?: number;
  /** Tamano de pagina actual */
  pageSize?: number;
  /** Callback al cambiar pagina */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Callback de busqueda (se llama con el texto y 300ms de debounce) */
  onSearch?: (value: string) => void;
  /** Callback al refrescar */
  onRefresh?: () => void;
  /** Callback de exportar a Excel */
  onExport?: () => void;
  /** Componente de filtros adicionales (dropdowns, rangepickers, etc.) */
  filterSlot?: React.ReactNode;
  /** Acciones en la barra superior (boton "Nuevo", etc.) */
  actionSlot?: React.ReactNode;
  /** Placeholder del buscador */
  searchPlaceholder?: string;
  /** Cargando datos */
  loading?: boolean;
  /** Texto cuando no hay datos */
  emptyText?: string;
  /** Seleccion de filas */
  rowSelection?: TableProps<T>["rowSelection"];
  /** Scroll horizontal */
  scrollX?: number | string;
}

/**
 * DataTable generico — componente central de listado del ERP.
 *
 * Caracteristicas:
 * - Busqueda con debounce integrada
 * - Paginacion server-side o client-side
 * - Slot para filtros adicionales (fechas, categorias, etc.)
 * - Slot para acciones (boton "Nuevo registro")
 * - Boton de refresh
 * - Boton de exportar a Excel (opcional)
 * - Scroll horizontal automatico
 * - Loading state
 *
 * @example
 * <DataTable
 *   columns={columnas}
 *   dataSource={productos}
 *   rowKey="id"
 *   total={total}
 *   onSearch={setSearch}
 *   onRefresh={refetch}
 *   actionSlot={<Button onClick={onNew}>Nuevo</Button>}
 * />
 */
export function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  total,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onSearch,
  onRefresh,
  onExport,
  filterSlot,
  actionSlot,
  searchPlaceholder = "Buscar...",
  loading = false,
  emptyText = "No hay datos",
  rowSelection,
  scrollX,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (!onSearch) return;
      const timer = setTimeout(() => {
        onSearch(value);
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer, onSearch]
  );

  const resolvedRowKey = typeof rowKey === "function"
    ? rowKey
    : (row: T) => String(row[rowKey]);

  return (
    <div>
      {/* Barra de herramientas */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }} align="middle">
        {/* Busqueda */}
        <Col flex="auto">
          <Row gutter={[8, 8]} align="middle">
            {onSearch && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder={searchPlaceholder}
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  onClear={() => handleSearch("")}
                />
              </Col>
            )}

            {/* Filtros adicionales */}
            {filterSlot && (
              <Col>
                <Space>
                  <FilterOutlined style={{ color: "#8c8c8c" }} />
                  {filterSlot}
                </Space>
              </Col>
            )}
          </Row>
        </Col>

        {/* Acciones derechas */}
        <Col>
          <Space>
            {onRefresh && (
              <Tooltip title="Actualizar">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  loading={loading}
                />
              </Tooltip>
            )}
            {onExport && (
              <Tooltip title="Exportar a Excel">
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={onExport}
                  style={{ color: "#52c41a", borderColor: "#52c41a" }}
                />
              </Tooltip>
            )}
            {actionSlot}
          </Space>
        </Col>
      </Row>

      {/* Tabla */}
      <Table<T>
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey={resolvedRowKey}
        loading={loading}
        rowSelection={rowSelection}
        scroll={{ x: scrollX ?? "max-content" }}
        locale={{ emptyText: <Text type="secondary">{emptyText}</Text> }}
        pagination={
          onPageChange
            ? {
                current: page,
                pageSize,
                total: total ?? dataSource.length,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showTotal: (t) => `${t} registros`,
                onChange: onPageChange,
                size: "small",
              }
            : {
                pageSize: DEFAULT_PAGE_SIZE,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showTotal: (t) => `${t} registros`,
                size: "small",
              }
        }
      />
    </div>
  );
}
