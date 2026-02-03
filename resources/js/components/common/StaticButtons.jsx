import { Loader2 } from 'lucide-react';

export default function StaticButtons({ discardText = "", discardClick = undefined, saveText = "", saveClick = undefined, dataLoading=false, error="" }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white lg:ml-[260px] p-4 sm:px-10">
      <div className="flex justify-end gap-3">
        {discardText!=='' && discardClick!==undefined && (
            <button 
            onClick={discardClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-xl cursor-pointer border border-gray-200"
            >
            {discardText}
            </button>
        )}
        {saveText!=='' && saveClick!==undefined && (
            <button
            onClick={saveClick}
            disabled={dataLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/90"
            >
                {dataLoading && (<Loader2 className="animate-spin" size={18} />)}
                {saveText}
            </button>
        )}
      </div>
        
      {error!=='' &&
        <div className="text-end">
            ⚠️ <span className="text-red-500 text-xs font-bold mt-2 animate-pulse">{error}</span>
        </div>
      }
    </div>
  );
}
