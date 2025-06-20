import React, { useRef } from 'react';
import { ReactComponent as Logo } from '../assets/images/obra-azul-horizontal.svg';
import { DownloadIcon } from '../assets/images/icons';

export default function PreviewView({ quote, setView }) {
    const validityDate = new Date(quote.createdAt.seconds * 1000);
    validityDate.setDate(validityDate.getDate() + 15);

    return (
        <div className="bg-gray-100 p-4 sm:p-8">
            <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none; } }`}</style>
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center no-print">
                <button onClick={() => setView('dashboard')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">Volver</button>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2">
                     <DownloadIcon /> Imprimir / Guardar PDF
                </button>
            </div>

            <div id="print-area" className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 sm:p-12">
                <header className="flex flex-col sm:flex-row justify-between items-start pb-4">
                    <div className="w-48 mb-6 sm:mb-0">
                         <Logo className="w-full" />
                    </div>
                    
                    <div className="text-right"><h1 className="text-3xl font-bold text-gray-800">PRESUPUESTO</h1><p className="text-gray-500 mt-2">Presupuesto N°: <span className="font-medium text-gray-700">{String(quote.quoteNumber).padStart(5, '0')}</span></p><div className="mt-4 text-sm"><p className="font-semibold text-gray-800">Obra Azul Piscinas</p><p className="text-gray-500">Dirección de la Empresa, Ciudad, CP</p><p className="text-gray-500">email@obraazul.com | +54 11 1234 5678</p></div></div>
                </header>
                <div className="my-8 border-b border-gray-200"></div>
                <main>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div><h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente:</h2><p className="font-bold text-gray-800">{quote.clientName}</p><p className="text-gray-600">{quote.clientAddress}</p><p className="text-gray-600">{quote.clientContact}</p></div>
                        <div className="text-right"><h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Fechas:</h2><p className="text-gray-600"><strong>Fecha de emisión:</strong> {new Date(quote.createdAt.seconds * 1000).toLocaleDateString()}</p><p className="text-gray-600"><strong>Válido hasta:</strong> {validityDate.toLocaleDateString()}</p></div>
                    </div>
                    <div className="grid grid-cols-12 gap-4 px-3 pb-2 border-b-2 border-gray-300">
                        <div className="col-span-2"><h3 className="font-semibold text-gray-600 uppercase">Producto</h3></div>
                        <div className="col-span-8"><h3 className="font-semibold text-gray-600 uppercase">Descripción</h3></div>
                        <div className="col-span-2 text-right"><h3 className="font-semibold text-gray-600 uppercase">Total</h3></div>
                    </div>
                    {quote.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-start py-4 border-b">
                        <div className="col-span-2"><p className="font-bold text-gray-800 pt-1">{item.service}</p></div>
                        <div className="col-span-10 space-y-3">
                            {item.isPackage ? (
                                <>
                                {item.subItems.map((sub, subIndex) => (
                                    <div key={subIndex} className="grid grid-cols-10">
                                        <p className="col-span-8 text-gray-700">{sub.description}</p>
                                        <p className="col-span-2 text-right font-medium">{item.showSubItemPrices ? `$${parseFloat(sub.value).toFixed(2)}` : '-'}</p>
                                    </div>
                                ))}
                                <div className="grid grid-cols-10 pt-2 mt-2 border-t">
                                    <p className="col-span-8 font-semibold text-gray-800">{item.laborType}</p>
                                    <p className="col-span-2 text-right font-bold">${item.subItems.reduce((acc, sub) => acc + (parseFloat(sub.value) || 0), 0).toFixed(2)}</p>
                                </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-10">
                                    <p className="col-span-8 text-gray-700">{item.description}</p>
                                    <p className="col-span-2 text-right font-bold">${parseFloat(item.value).toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    ))}
                    <div className="flex justify-end mt-8"><div className="w-full max-w-sm"><div className="flex justify-between font-bold text-xl text-gray-800"><p>TOTAL A PAGAR:</p><p>${quote.total.toFixed(2)}</p></div></div></div>
                    <div className="mt-16 pt-8 border-t border-gray-200"><h3 className="text-base font-semibold text-gray-800 mb-4">Términos y Condiciones</h3><ul className="text-xs text-gray-500 space-y-2 list-disc list-inside"><li><strong>Validez de la oferta:</strong> Este presupuesto es válido por 15 días corridos desde su fecha de emisión.</li><li><strong>Condiciones de Pago:</strong> Se requiere un anticipo del 50% para iniciar los trabajos y el 50% restante al finalizar la obra. Medios de pago: Transferencia bancaria, MercadoPago.</li><li><strong>Garantía:</strong> Se ofrece una garantía de 12 meses sobre la mano de obra de las reparaciones realizadas y la que corresponda por parte del fabricante sobre los materiales utilizados. La garantía no cubre daños causados por mal uso, movimientos estructurales del terreno o factores climáticos extremos.</li></ul></div>
                </main>
                <footer className="text-center mt-12 pt-6 border-t border-gray-200"><p className="text-gray-600">Gracias por su confianza.</p><p className="text-xs text-gray-400 mt-1">Obra Azul Piscinas - [www.obraazul.com](https://www.obraazul.com)</p></footer>
            </div>
        </div>
    );
}
