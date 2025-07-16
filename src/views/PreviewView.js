import React from 'react';
import { ReactComponent as Logo } from '../assets/images/obra-azul-horizontal.svg';
import { DownloadIcon } from '../assets/images/icons';
// ¡Importante! Asegúrate de tener el archivo 'formatters.js' en la ruta correcta.
import { formatPrice } from '../utils/formatters';

export default function PreviewView({ quote, setView }) {
    // Verificación para evitar errores si 'quote' no existe
    if (!quote || !quote.createdAt) {
        return (
            <div className="text-center p-10">
                <p>No hay datos del presupuesto para mostrar.</p>
                <button onClick={() => setView('dashboard')} className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                    Volver
                </button>
            </div>
        );
    }

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
                    
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-gray-800">PRESUPUESTO</h1>
                        <p className="text-gray-500 mt-2">Presupuesto N°: <span className="font-medium text-gray-700">{String(quote.quoteNumber || '0').padStart(5, '0')}</span></p>
                        <div className="mt-4 text-sm">
                            <p className="font-semibold text-gray-800">Obra Azul Piscinas</p>
                            <p className="text-gray-500">Zufriategui 4005, Villa Martelli, B1603, Provincia de Buenos Aires</p>
                            <p className="text-gray-500">obraazulpiscinas@gmail.com | +54 9 11 7238 7553</p>
                        </div>
                    </div>
                </header>
                <div className="my-8 border-b border-gray-200"></div>
                <main>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente:</h2>
                            <p className="font-bold text-gray-800">{quote.clientName}</p>
                            <p className="text-gray-600">{quote.clientAddress}</p>
                            <p className="text-gray-600">{quote.clientContact}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Fechas:</h2>
                            <p className="text-gray-600"><strong>Fecha de emisión:</strong> {new Date(quote.createdAt.seconds * 1000).toLocaleDateString()}</p>
                            <p className="text-gray-600"><strong>Válido hasta:</strong> {validityDate.toLocaleDateString()}</p>
                        </div>
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
                                        <p className="col-span-2 text-right font-medium">
                                            {item.showSubItemPrices ? formatPrice(sub.value, quote.currency) : '-'}
                                        </p>
                                    </div>
                                ))}
                                <div className="grid grid-cols-10 pt-2 mt-2 border-t">
                                    <p className="col-span-8 font-semibold text-gray-800">{item.laborType}</p>
                                    <p className="col-span-2 text-right font-bold">
                                        {formatPrice(item.subItems.reduce((acc, sub) => acc + (parseFloat(sub.value) || 0), 0), quote.currency)}
                                    </p>
                                </div>
                                </>
                            ) : (
                                <>
                                <div className="grid grid-cols-10">
                                    <p className="col-span-8 text-gray-700">{item.description}</p>
                                    <p className="col-span-2 text-right font-medium">-</p>
                                </div>
                                <div className="grid grid-cols-10 pt-2 mt-2 border-t">
                                    <p className="col-span-8 font-semibold text-gray-800">{item.laborType}</p>
                                    <p className="col-span-2 text-right font-bold">
                                        {item.showPrice ? formatPrice(item.value, quote.currency) : '-'}
                                    </p>
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                    ))}
                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm">
                            <div className="flex justify-between font-bold text-xl text-gray-800 bg-gray-100 p-4 rounded-lg">
                                <span>TOTAL A PAGAR ({quote.currency}):</span>
                                <span>{formatPrice(quote.total, quote.currency)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-gray-200 text-xs text-gray-600">
                        <h3 className="text-base font-semibold text-gray-800 mb-6 text-center">Términos y Condiciones Generales de Contratación de Servicios</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">1. Aceptación del Presupuesto y Validez de la Oferta</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Validez:</span> Todo presupuesto emitido tiene una validez de <strong>15 días corridos a partir de la fecha de su emisión</strong>. Transcurrido dicho plazo, los precios y condiciones podrán estar sujetos a modificaciones.</li>
                                    <li><span className="font-semibold">Aceptación:</span> La aprobación del presupuesto por parte del cliente formaliza el acuerdo y la aceptación de estos términos y condiciones.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">2. Condiciones de Pago</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Anticipo:</span> Para el inicio de obras con materiales incluidos, se requerirá el pago de un anticipo correspondiente al <strong>40%</strong> del valor total del presupuesto. Este anticipo se destinará a la compra de materiales y a la movilización del equipo de trabajo.</li>
                                    <li><span className="font-semibold">Saldo:</span> El <strong>60% restante</strong> deberá ser abonado en 3 partes por avance de obra (inicio, promedio, final). En trabajos de hidráulica se dejará un <strong>10%</strong> a cobrar posterior a la puesta en marcha final de los equipos.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">3. Alcance de los Trabajos y Materiales</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Descripción:</span> Los trabajos a realizar son únicamente los que se encuentran explícitamente descritos en el presupuesto aceptado. Cualquier tarea adicional no contemplada será presupuestada por separado y requerirá la aprobación del cliente.</li>
                                    <li><span className="font-semibold">Calidad de Materiales:</span> Nos comprometemos a utilizar materiales de primera calidad y marcas reconocidas en el mercado (ej. Vulcano, Plufilt, ESPA, Cepex, Tigre), empleando cañerías de PVC clase 10 ajustadas a las normas IRAM.</li>
                                    <li><span className="font-semibold">Materiales a Cargo del Cliente:</span> En los casos en que el presupuesto especifique que algún ítem es "a cargo del cliente" (ej. revestimientos, ionizadores, escaleras o volquetes), será su responsabilidad la compra y entrega en obra de dichos materiales en tiempo y forma para no generar demoras. Con previo acuerdo, podrá ser comprado por nuestro equipo, debiendo abonarse contra la presentación del comprobante o factura.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">4. Plazos de Ejecución de Obra</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Duración Estimada:</span> El presupuesto incluye una duración estimada de la obra en días hábiles. Este plazo es una estimación y no contempla demoras ocasionadas por factores climáticos adversos, retrasos en la entrega de materiales por parte del cliente, o modificaciones o trabajos adicionales solicitados por el mismo.</li>
                                    <li><span className="font-semibold">Inicio de Obra:</span> La fecha de inicio de los trabajos se coordinará entre ambas partes.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">5. Póliza de Garantía</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Mano de Obra:</span> Ofrecemos una garantía de <strong>12 meses</strong> sobre la mano de obra de las reparaciones realizadas. En el caso específico de la instalación hidráulica completa, la garantía se extiende a <strong>2 años</strong>.</li>
                                    <li><span className="font-semibold">Reparación de Fisuras:</span> La garantía sobre reparación de fisuras y grietas cubre únicamente las zonas intervenidas con las técnicas descritas en el presupuesto (ej. llaves de acero y materiales cementicios). No cubre una garantía total de la piscina ni la aparición de nuevas fisuras en áreas no reparadas.</li>
                                    <li><span className="font-semibold">Equipos y Materiales:</span> La garantía sobre los equipos y materiales instalados (bombas, filtros, luces, etc.) será la que ofrezca el fabricante de cada producto. Obra Azul actuará como intermediario para gestionar el reclamo ante el proveedor, pero no es el garante final del producto.</li>
                                    <li><span className="font-semibold">Construcciones:</span> Cuentan con una garantía de <strong>10 años</strong>, que cubre defectos estructurales y de ejecución derivados de la construcción original. Esta garantía aplica exclusivamente a trabajos realizados por nuestro personal y bajo nuestras especificaciones técnicas.</li>
                                    <li><span className="font-semibold">Exclusiones de la Garantía:</span> La garantía quedará sin efecto ante daños o desperfectos causados por mal uso, negligencia o mantenimiento inadecuado por parte del cliente o terceros; movimientos estructurales del terreno o de la construcción ajenos a la piscina; factores climáticos extremos (inundaciones, heladas severas, etc.); o intervención, manipulación o modificación de las instalaciones por parte de terceros no autorizados por Obra Azul.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">6. Responsabilidades del Cliente</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Accesos y Espacio de Trabajo:</span> El cliente deberá proveer un acceso claro y seguro al área de trabajo, así como el espacio necesario para el acopio de materiales y herramientas.</li>
                                    <li><span className="font-semibold">Servicios Básicos:</span> Es responsabilidad del cliente asegurar la disponibilidad de baño, agua corriente y energía eléctrica en el lugar de la obra durante toda su ejecución.</li>
                                    <li><span className="font-semibold">Retiro de Escombros:</span> De ser necesaria la contratación de volquetes para el retiro de escombros, tierra o materiales sobrantes, el costo y la gestión de los mismos correrán por cuenta del cliente.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-1">7. Consideraciones Finales</h4>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li><span className="font-semibold">Seguridad:</span> Nuestro personal afectado a la obra cuenta con Seguro de Accidentes de Trabajo vigente, brindando tranquilidad y respaldo durante la ejecución de las tareas.</li>
                                    <li><span className="font-semibold">Confidencialidad:</span> La información y datos del cliente serán tratados con total confidencialidad.</li>
                                </ul>
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
                            La aceptación de la propuesta económica implica la aceptación de la totalidad de los términos y condiciones aquí expresados.
                        </p>
                    </div>
                </main>
                <footer className="text-center mt-12 pt-6 border-t border-gray-200">
                    <p className="text-gray-600">Gracias por su confianza.</p>
                    <p className="text-xs text-gray-400 mt-1">Obra Azul Piscinas - www.obraazul.com</p>
                </footer>
            </div>
        </div>
    );
}