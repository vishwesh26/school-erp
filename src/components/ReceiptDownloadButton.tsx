"use client";

import Image from "next/image";

// Utility to convert number to words
const numberToWords = (num: number): string => {
    const a = [
        "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
        "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if ((num = num.toString().length > 9 ? parseFloat(num.toString().slice(0, 9)) : num) === 0) return "Zero";

    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    let str = "";

    const getWords = (section: string) => {
        const val = parseInt(section);
        if (val === 0) return "";
        if (val < 20) return a[val];
        return b[parseInt(section[0])] + (section[1] !== '0' ? " " + a[parseInt(section[1])] : "");
    };

    if (n[1] !== '00') str += getWords(n[1]) + "Crore ";
    if (n[2] !== '00') str += getWords(n[2]) + "Lakh ";
    if (n[3] !== '00') str += getWords(n[3]) + "Thousand ";
    if (n[4] !== '0') str += a[parseInt(n[4])] + "Hundred ";
    if (n[5] !== '00') str += (str !== "" ? "and " : "") + getWords(n[5]);

    return str.replace(/\s+/g, ' ').trim() + " Only";
};

const ReceiptDownloadButton = ({
    studentName,
    fatherName,
    rollNumber,
    standard,
    feeName,
    amount,
    date,
    receiptNumber,
    installments = [],
    payments = [],
}: {
    studentName: string;
    fatherName: string;
    rollNumber: string;
    standard: string;
    feeName: string;
    amount: number;
    date: string;
    receiptNumber: string;
    installments?: any[];
    payments?: any[];
}) => {

    const handleDownload = async () => {
        // Dynamically import to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;

        const amountInWords = numberToWords(amount);

        // Sort installments and payments
        const sortedInstallments = [...installments].sort((a, b) => a.installmentOrder - b.installmentOrder);
        const sortedPayments = [...payments].sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

        // Match installments with payments to find payment dates
        let remainingPaidAmount = amount;
        const installmentHistory = sortedInstallments.map(inst => {
            const instAmount = Number(inst.amount);
            const paidForThisInst = Math.min(instAmount, remainingPaidAmount);
            remainingPaidAmount -= paidForThisInst;

            let paidDate = "Pending";
            if (paidForThisInst >= instAmount) {
                const prevInstsTotal = sortedInstallments
                    .filter(i => i.installmentOrder < inst.installmentOrder)
                    .reduce((sum, i) => sum + Number(i.amount), 0);

                const targetCumulative = prevInstsTotal + instAmount;

                let cumulativePayment = 0;
                const completingPayment = sortedPayments.find(p => {
                    cumulativePayment += Number(p.amount);
                    return cumulativePayment >= targetCumulative;
                });

                if (completingPayment) {
                    paidDate = new Date(completingPayment.paymentDate).toLocaleDateString();
                }
            } else if (paidForThisInst > 0) {
                paidDate = "Partial";
            }

            return {
                name: `Installment ${inst.installmentOrder}`,
                amount: instAmount,
                date: paidDate
            };
        }).filter(h => h.date !== "Pending");

        const element = document.createElement("div");
        element.innerHTML = `
      <div style="padding: 20px; font-family: 'Times New Roman', serif; max-width: 800px; border: 2px solid #000; margin: 0 auto; color: #000;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">Dr Cyrus Poonawalla English Medium School.</h1>
            <p style="margin: 5px 0 0; font-size: 12px;">Modak Mala,Uruli Kanchan, Tal-Haveli, Dist-Pune</p>
            <p style="margin: 0; font-size: 12px;">Pin- 412202.</p>
            <p style="margin: 0; font-size: 12px;">Ph. : 72180 06721</p>
        </div>

        <div style="border: 2px solid #000; text-align: center; padding: 5px; margin-bottom: 10px; font-weight: bold; font-size: 20px;">
            FEES RECEIPT
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #000; font-size: 14px;">
            <div style="border-right: 1px solid #000;">
                <div style="display: flex; border-bottom: 1px solid #000; padding: 5px;">
                    <div style="width: 120px; font-weight: bold;">Receipt No.</div>
                    <div>${receiptNumber}</div>
                </div>
                 <div style="display: flex; border-bottom: 1px solid #000; padding: 5px;">
                    <div style="width: 120px; font-weight: bold;">Roll No.</div>
                    <div>${rollNumber}</div>
                </div>
                <div style="display: flex; border-bottom: 1px solid #000; padding: 5px;">
                    <div style="width: 120px; font-weight: bold;">Student Name</div>
                    <div>${studentName}</div>
                </div>
                <div style="display: flex; border-bottom: 1px solid #000; padding: 5px;">
                    <div style="width: 120px; font-weight: bold;">Father's Name</div>
                    <div>${fatherName}</div>
                </div>
                 <div style="display: flex; padding: 5px;">
                    <div style="width: 120px; font-weight: bold;">Class / Standard</div>
                    <div>${standard}</div>
                </div>
            </div>

            <div>
                 <div style="display: flex; border-bottom: 1px solid #000; padding: 5px;">
                    <div style="width: 50px; font-weight: bold;">Date :</div>
                    <div>${date}</div>
                </div>
                 <div style="padding: 5px;"></div>
            </div>
        </div>

         <div style="border: 1px solid #000; margin-top: 10px; font-size: 14px;">
            <div style="display: flex; border-bottom: 1px solid #000; background-color: #fff; font-weight: bold;">
                <div style="flex: 1; padding: 5px; text-align: center; border-right: 1px solid #000;">Student's Fees Details</div>
                <div style="width: 150px; padding: 5px; text-align: center;">Amount</div>
            </div>

            <div style="display: flex; border-bottom: 1px solid #000; min-height: 100px;">
                 <div style="flex: 1; padding: 5px; border-right: 1px solid #000;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${feeName}</div>
                    ${installmentHistory.length > 0 ? `
                        <div style="font-size: 12px; margin-left: 10px;">
                            ${installmentHistory.map(h => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                    <span>${h.name} Paid on ${h.date}</span>
                                    <span>${h.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                 </div>
                 <div style="width: 150px; padding: 5px; text-align: center;"></div>
            </div>

             <div style="display: flex; border-bottom: 1px solid #000; background-color: #ccc; font-weight: bold;">
                 <div style="flex: 1; padding: 5px; text-align: right; border-right: 1px solid #000;"></div>
                 <div style="width: 150px; padding: 5px; text-align: center;">${amount.toLocaleString()}</div>
            </div>

            <div style="display: flex; border-bottom: 1px solid #000;">
                 <div style="flex: 1; padding: 5px; text-align: center; border-right: 1px solid #000; font-weight: bold;">Total Fee</div>
                 <div style="width: 150px; padding: 5px; text-align: center;">${amount.toLocaleString()}</div>
            </div>
             <div style="display: flex; border-bottom: 1px solid #000;">
                 <div style="flex: 1; padding: 5px; text-align: center; border-right: 1px solid #000; font-weight: bold;">Paid Fee</div>
                 <div style="width: 150px; padding: 5px; text-align: center;">${amount.toLocaleString()}</div>
            </div>
             <div style="display: flex;">
                 <div style="flex: 1; padding: 5px; text-align: center; border-right: 1px solid #000; font-weight: bold;">Balance Fee</div>
                 <div style="width: 150px; padding: 5px; text-align: center;">0</div>
            </div>
        </div>

        <div style="border: 1px solid #000; padding: 5px; margin-top: 5px; font-size: 14px; font-weight: bold;">
            Rupees ${amountInWords}
        </div>
      </div>
    `;

        const opt = {
            margin: 0.5,
            filename: `Receipt-${studentName}-${receiptNumber}.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
        };

        const doc = html2pdf().set(opt).from(element);
        doc.save();
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-lamaSky"
        >
            <Image src="/download.png" alt="" width={14} height={14} />
            Receipt
        </button>
    );
};

export default ReceiptDownloadButton;
