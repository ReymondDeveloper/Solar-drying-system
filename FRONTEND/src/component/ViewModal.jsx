import { RiCloseLargeLine } from "react-icons/ri";
import Button from "./Button";

function ViewModal({ setModal, title, datas }) {
  const imageItem = datas.find((d) => d.image_url);
  const detailItems = datas.filter((d) => !d.image_url);
  console.log("datasView:", datas);
  console.log("imageItem:", imageItem);
  
  return (
    <div
      onClick={() => setModal(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h1 className="text-2xl font-bold text-green-700">{title}</h1>
          <button
            type="button"
            onClick={() => setModal(false)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <RiCloseLargeLine size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-center items-start">
            {imageItem?.image_url ? (
              <img
                src={imageItem.image_url}
                alt="Dryer"
                className="w-full max-w-sm h-auto object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full max-w-sm h-64 flex items-center justify-center border rounded-lg text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {detailItems.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-lg overflow-hidden bg-gray-50"
              >
                <div className="bg-green-600 text-white font-semibold px-3 py-1 text-sm">
                  {item.label}
                </div>
                <div className="p-2 text-gray-700 text-sm">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            onClick={() => setModal(false)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
