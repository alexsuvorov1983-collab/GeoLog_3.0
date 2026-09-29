interface Props {
  boreholeNumber?: string;
  user?: string;
  modifiedAt?: string;
  totalObjects: number;
}

export default function StatusBar({ boreholeNumber, user, modifiedAt, totalObjects }: Props) {
  return (
    <div className="bg-[#f0f0f0] border-t border-[#c0c0c0] flex items-center px-3 text-xs text-[#555]" style={{ height: '22px' }}>
      <span className="mr-4">
        Скважина: <strong>{boreholeNumber || '—'}</strong>
      </span>
      <span className="mr-4">
        Пользователь: <strong>{user || '—'}</strong>
      </span>
      <span className="mr-4">
        Время модификации: <strong>{modifiedAt || '—'}</strong>
      </span>
      <span className="ml-auto">
        Всего объектов: <strong>{totalObjects}</strong>
      </span>
    </div>
  );
}
