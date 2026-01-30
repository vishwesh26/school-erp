"use client";

import React from "react";
import Barcode from "react-barcode";

const LibraryBarcode = ({ value }: { value: string }) => {
    return (
        <div className="flex flex-col items-center p-4 bg-white border rounded-md shadow-sm w-full max-w-sm mx-auto">
            <div className="text-xs text-gray-500 mb-2">LIBRARY CARD</div>

            <div className="w-full flex justify-center overflow-auto">
                <Barcode
                    value={value || "NO-ID"}
                    width={2}
                    height={60}
                    format="CODE128"
                    displayValue={true}
                    fontOptions="bold"
                    textMargin={6}
                    background="#ffffff"
                    lineColor="#000000"
                />
            </div>
        </div>
    );
};

export default LibraryBarcode;
