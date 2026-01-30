"use client";
import { useState } from "react";
import { increaseClassStrength } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";

const IncreaseStrengthButton = ({ classId, initialCapacity }: { classId: number, initialCapacity: number }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleIncrease = async () => {
        if (!confirm(`Are you sure you want to increase this class strength by +5?`)) return;

        setLoading(true);
        const result = await increaseClassStrength(classId, 5);
        setLoading(false);

        if (result.success) {
            toast.success(`Class capacity increased to ${result.newCapacity}!`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to increase strength");
        }
    };

    return (
        <button
            onClick={handleIncrease}
            disabled={loading}
            title="Increase Strength (+5)"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-400 transition-colors disabled:bg-gray-300"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <Image src="/create.png" alt="Increase" width={14} height={14} />
            )}
        </button>
    );
};

export default IncreaseStrengthButton;
