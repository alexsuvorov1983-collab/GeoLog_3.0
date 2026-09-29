import { Borehole } from '../core/dataStore';

interface Props {
  openDocs: { id: string; title: string; dirty: boolean }[];
  activeDocId: string;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  boreholes: Borehole[];
  selectedBoreholeId: string | null;
  onSelectBorehole: (id: string) => void;
}

// GAP-поля (не в схеме v1.3)
const GAP_FIELDS = ['side_id', 'rig_id', 'method_id', 'diameter_id', 'casing_diameter_id', 'executor'];

const columns = [
  { key: 'number', label: 'Номер', gap: false },
  { key: 'depth_m', label: 'Глубина', gap: false },
  { key: 'elev_m', label: 'Отметка', gap: false },
  { key: 'x', label: 'X', gap: false },
  { key: 'y', label: 'Y', gap: false },
  { key: 'wgs84_lon', label: 'WGS84 Долгота', gap: false },
  { key: 'wgs84_lat', label: 'WGS84 Широта', gap: false },
  { key: 'side_id', label: 'Сторонность', gap: true },
  { key: 'rig_id', label: 'Буровая установка', gap: true },
  { key: 'method_id', label: 'Способ проходки', gap: true },
  { key: 'diameter_id', label: 'Диаметр', gap: true },
  { key: 'casing_depth_m', label: 'Глубина обсадки', gap: false },
  { key: 'casing_diameter_id', label: 'Диаметр обсадки', gap: true },
  { key: 'reaming_m', label: 'Разбуривание', gap: false },
  { key: 'gso_m', label: 'ГСО', gap: false },
  { key: 'gsp_m', label: 'ГСП', gap: false },
  { key: 'mmg_m', label: 'ММГ', gap: false },
  { key: 'executor', label: 'Исполнитель', gap: true },
];

function formatValue(key: string, value: any): string {
  if (value === null || value === undefined) return '';
  if (['depth_m', 'elev_m', 'x', 'y', 'wgs84_lon', 'wgs84_lat', 'casing_depth_m', 'reaming_m', 'gso_m', 'gsp_m', 'mmg_m'].includes(key)) {
    return typeof value === 'number' ? value.toFixed(2) : String(value);
  }
  if (key === 'date') {
    return String(value); // Already in DD.MM.YYYY format
  }
  return String(value);
}

export default function MDIArea({ openDocs, activeDocId, onActivate, onClose, boreholes, selectedBoreholeId, onSelectBorehole }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#e0e0e0]">
      {/* Document Tabs */}
      <div className="flex bg-[#f0f0f0] border-b border-[#c0c0c0] overflow-x-auto" style={{ height: '24px' }}>
        {openDocs.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center px-3 border-r border-[#c0c0c0] cursor-pointer text-xs ${
              activeDocId === doc.id ? 'bg-white font-semibold' : 'bg-[#e8e8e8] hover:bg-[#f0f0ff]'
            }`}
            onClick={() => onActivate(doc.id)}
          >
            <span>{doc.title}{doc.dirty ? ' *' : ''}</span>
            <button
              className="ml-2 w-4 h-4 flex items-center justify-center hover:bg-[#ff6666] hover:text-white rounded text-[10px]"
              onClick={(e) => { e.stopPropagation(); onClose(doc.id); }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white">
        {openDocs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#808080] text-sm">
            Нет открытых документов
          </div>
        ) : activeDocId === 'doc-boreholes' ? (
          <BoreholeTable
            boreholes={boreholes}
            selectedId={selectedBoreholeId}
            onSelect={onSelectBorehole}
          />
        ) : (
          <div className="p-4 text-sm text-[#808080]">Документ</div>
        )}
      </div>
    </div>
  );
}

function BoreholeTable({ boreholes, selectedId, onSelect }: { boreholes: Borehole[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-auto h-full">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#e8e8e8] border-b border-[#c0c0c0]">
            <th className="px-2 py-1 text-left border-r border-[#c0c0c0] font-semibold w-8">#</th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-2 py-1 text-left border-r border-[#c0c0c0] font-semibold whitespace-nowrap ${col.gap ? 'bg-[#f0e8e8] text-[#999]' : ''}`}
                title={col.gap ? 'Поле появится в схеме v1.4 (GAP)' : col.label}
              >
                {col.label}
                {col.gap && <span className="text-[9px] ml-1">⚠</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {boreholes.map((bh, idx) => (
            <tr
              key={bh.id}
              className={`cursor-pointer border-b border-[#e8e8e8] ${selectedId === bh.id ? 'bg-[#c8d8ff]' : idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f8f8]'} hover:bg-[#e0e8ff]`}
              onClick={() => onSelect(bh.id)}
            >
              <td className="px-2 py-0.5 border-r border-[#e8e8e8] text-[#808080]">{idx + 1}</td>
              {columns.map((col) => {
                const value = (bh as any)[col.key];
                const formatted = formatValue(col.key, value);
                return (
                  <td
                    key={col.key}
                    className={`px-2 py-0.5 border-r border-[#e8e8e8] whitespace-nowrap ${col.gap ? 'text-[#bbb] italic' : ''}`}
                    title={col.gap ? 'Поле появится в схеме v1.4' : undefined}
                  >
                    {formatted}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
