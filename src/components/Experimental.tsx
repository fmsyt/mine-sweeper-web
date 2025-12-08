import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function Experimental() {
  return (
    <div className="w-full h-svh border-2 border-dashed border-gray-400">
      <TransformWrapper
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        minScale={0.5}
        maxScale={4}
        initialScale={1}
      >
        <TransformComponent
          wrapperStyle={{
            border: "2px solid red",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <div className="w-[calc(100svw*1.2)] h-[calc(100svh*1.2)] flex justify-center items-center border-4 border-gray-400">
            Experimental Component
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
