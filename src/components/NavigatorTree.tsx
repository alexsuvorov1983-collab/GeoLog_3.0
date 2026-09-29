import { useState } from 'react';
import { GeoLogData } from '../core/dataStore';
import { CommandRegistry } from '../core/commandRegistry';

interface Props {
  selectedBoreholeId: string | null;
  onSelect: (id: string | null) => void;
  onContextMenu: (e: React.MouseEvent, items: { label: string; commandId: string }[]) => void;
}

interface TreeNode {
  id: string;
  label: string;
  count?: number;
  children?: TreeNode[];
  commandId?: string;
  icon?: string;
}

export default function NavigatorTree({ selectedBoreholeId, onSelect, onContextMenu }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['geology', 'project', 'field', 'lab', 'processing']));

  const boreholes = GeoLogData.getAll();
  const dicts = GeoLogData.getDicts();

  const treeData: TreeNode[] = [
    {
      id: 'geology', label: 'ГЕОЛОГИЯ', icon: '🌍', children: [
        { id: 'lab-equip', label: `Лабораторное оборудование (${dicts.equipment.length})`, commandId: 'dicts.equipment', icon: '🔬' },
        { id: 'field-equip', label: `Полевое оборудование (${dicts.field_equipment.length})`, commandId: 'dicts.field_equipment', icon: '⛏️' },
        { id: 'soil-code', label: 'Кодификатор грунтов', commandId: 'dicts.soil_code', icon: '📖' },
        { id: 'rock-catalog', label: `Каталог скальных грунтов (${dicts.rock_catalog.length})`, commandId: 'dicts.rock_catalog', icon: '🪨' },
      ]
    },
    {
      id: 'project', label: '№ геология', icon: '📁', children: [
        { id: 'project-props', label: 'Свойства проекта', commandId: 'project.properties', icon: '⚙️' },
      ]
    },
    {
      id: 'field', label: 'ПОЛЕ', icon: '🏗️', children: [
        { id: 'boreholes', label: `Скважины (${boreholes.length})`, commandId: 'bore.open', icon: '🕳️', count: boreholes.length, children: [] },
        { id: 'cpt', label: 'Статическое зондирование', commandId: 'cpt.open', icon: '📊' },
        { id: 'dpt', label: 'Динамическое зондирование', commandId: 'dpt.open', icon: '📊' },
        { id: 'stamp', label: 'Штампы', commandId: 'stamp.open', icon: '📐' },
        { id: 'vane', label: 'Крыльчатка', commandId: 'vane.open', icon: '🌀' },
      ]
    },
    {
      id: 'lab', label: 'ЛАБОРАТОРИЯ', icon: '🧪', children: [
        { id: 'soil-samples', label: 'Пробы грунта', commandId: 'samples.soil', icon: '🏔️' },
        { id: 'water-samples', label: 'Пробы воды', commandId: 'samples.water', icon: '💧' },
      ]
    },
    {
      id: 'processing', label: 'ОБРАБОТКА', icon: '📈', children: [
        { id: 'ige', label: 'ИГЭ', commandId: 'ige.open', icon: '📋' },
        { id: 'aquifers', label: 'Водоносные горизонты', commandId: 'aquifers.open', icon: '💦' },
        { id: 'subsidence', label: 'Тип просадки', commandId: 'subsidence.open', icon: '⚠️' },
        { id: 'pile-bearing', label: 'Несущая способность свай', commandId: 'pile.open', icon: '🏗️' },
      ]
    },
  ];

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNodeClick = (node: TreeNode) => {
    if (node.id === 'boreholes') {
      // Open boreholes doc
      onSelect(null);
    } else if (node.commandId) {
      CommandRegistry.execute(node.commandId);
    }
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = (node.children && node.children.length > 0) || node.id === 'boreholes';
    const isExpanded = expanded.has(node.id);
    const isSelected = node.id === selectedBoreholeId;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-0.5 px-1 cursor-pointer hover:bg-[#e8e8ff] ${isSelected ? 'bg-[#c8c8ff]' : ''}`}
          style={{ paddingLeft: `${level * 16 + 4}px` }}
          onClick={() => {
            if (hasChildren) toggleExpand(node.id);
            else handleNodeClick(node);
          }}
          onDoubleClick={() => {
            if (node.id === 'boreholes') {
              CommandRegistry.execute('bore.open');
            }
          }}
          onContextMenu={(e) => {
            const items = [];
            if (node.commandId) items.push({ label: 'Открыть', commandId: node.commandId });
            if (node.id === 'boreholes') {
              items.push({ label: 'Создать скважину', commandId: 'bore.create' });
              items.push({ label: 'Удалить', commandId: 'bore.delete' });
            }
            if (items.length > 0) onContextMenu(e, items);
          }}
        >
          {hasChildren && (
            <span className="w-4 text-center text-[10px]">{isExpanded ? '▼' : '▶'}</span>
          )}
          {!hasChildren && <span className="w-4" />}
          <span className="mr-1">{node.icon || '📄'}</span>
          <span className="text-xs truncate">{node.label}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.id === 'boreholes' ? (
              // Render borehole entries
              boreholes.map((bh) => (
                <div
                  key={bh.id}
                  className={`flex items-center py-0.5 px-1 cursor-pointer hover:bg-[#e8e8ff] ${selectedBoreholeId === bh.id ? 'bg-[#c8c8ff]' : ''}`}
                  style={{ paddingLeft: `${(level + 1) * 16 + 4}px` }}
                  onClick={() => onSelect(bh.id)}
                  onContextMenu={(e) => {
                    onSelect(bh.id);
                    onContextMenu(e, [
                      { label: 'Изменить', commandId: 'bore.edit' },
                      { label: 'Удалить', commandId: 'bore.delete' },
                      { label: 'Найти на чертеже', commandId: 'bore.find' },
                    ]);
                  }}
                >
                  <span className="w-4" />
                  <span className="mr-1">🕳️</span>
                  <span className="text-xs">{bh.number}</span>
                </div>
              ))
            ) : (
              node.children!.map((child) => renderNode(child, level + 1))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[240px] min-w-[200px] bg-white border-r border-[#c0c0c0] flex flex-col overflow-hidden">
      <div className="bg-[#e8e8e8] border-b border-[#c0c0c0] px-2 py-1 text-xs font-bold">
        Навигатор
      </div>
      <div className="flex-1 overflow-y-auto">
        {treeData.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
