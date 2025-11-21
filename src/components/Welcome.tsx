'use client';
import TypingAnimation from "./Materials/TypingAnimation";
export default function Welcome() {
    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-2">
                <div className='w-full'>
                    <div className="bg-[#ffffffb2] rounded-[18px] p-4 h-[80vh] flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scroll mb-4">
                            <div className="flex flex-col items-center justify-center h-full">
                                <h1 className="md:text-3xl bg-gradient-to-r from-[#002e75] to-[#076dfe] bg-clip-text text-transparent mb-4">
                                    <TypingAnimation />
                                </h1>
                                <p className="text-[#44474E] text-[12px] md:text-[16px] text-center max-w-[290px]">
                                    Creative ideas to technical explanations. I m here to help!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}