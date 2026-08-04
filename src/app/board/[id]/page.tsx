import Navbar from '../../../components/ui/Navbar';
import Toolbar from '../../../components/ui/Toolbar';
import WhiteboardCanvas from '../../../components/canvas/WhiteboardCanvas';
import PropertyPanel from '../../../components/properties/PropertyPanel';

export default function BoardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Navbar />
      <div className="relative flex-1">
        <WhiteboardCanvas />
        <Toolbar />
        <PropertyPanel />
      </div>
    </div>
  );
}
