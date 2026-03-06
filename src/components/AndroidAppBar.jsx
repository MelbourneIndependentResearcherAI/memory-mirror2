import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Android Material Design 3 App Bar
 * Provides consistent, native-feeling header navigation across all pages
 */
export default function AndroidAppBar({ 
  title, 
  showBackButton = true, 
  onBackClick = null,
  actions = []
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md"
      style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '0',
        paddingRight: '0',
      }}
    >
      {/* Back Button */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="w-14 h-14 flex items-center justify-center flex-shrink-0 text-slate-200 hover:bg-slate-800/50 active:bg-slate-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      {/* Title */}
      <div className="flex-1 px-4">
        <h1 className="text-xl font-semibold text-white truncate leading-tight">
          {title}
        </h1>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-0">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="w-14 h-14 flex items-center justify-center text-slate-200 hover:bg-slate-800/50 active:bg-slate-700 transition-colors"
            aria-label={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  );
}