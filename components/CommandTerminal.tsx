import React, { useState, useEffect, useRef } from 'react';

interface TerminalLine {
    type: 'input' | 'output' | 'system' | 'boot';
    content: React.ReactNode;
}

export const CommandTerminal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [input, setInput] = useState('');
    const [isBooting, setIsBooting] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [startTime] = useState(new Date());
    const hasBooted = useRef(false);

    // Boot Sequence Logic
    useEffect(() => {
        if (isOpen && !hasBooted.current) {
            setIsBooting(true);
            hasBooted.current = true;
            
            const bootSequence = [
                { text: 'Initializing kernel...', delay: 100 },
                { text: 'Loading modules: [cpu] [mem] [net]', delay: 300 },
                { text: 'Mounting file system... OK', delay: 600 },
                { text: 'Starting network interface (eth0)...', delay: 900 },
                { text: 'Connection established: 127.0.0.1:22', delay: 1200 },
                { text: 'Welcome to ARK_OS v4.0.1', delay: 1500 },
                { text: 'Type "help" for available commands.', delay: 1600 },
            ];

            let currentDelay = 0;
            bootSequence.forEach(({ text, delay }) => {
                setTimeout(() => {
                    setLines(prev => [...prev, { type: 'boot', content: text }]);
                }, delay);
                currentDelay = delay;
            });

            setTimeout(() => {
                setIsBooting(false);
                setTimeout(() => inputRef.current?.focus(), 50);
            }, currentDelay + 200);

        } else if (isOpen) {
             setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines, isOpen]);

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim().toLowerCase();
        const newLines: TerminalLine[] = [{ type: 'input', content: cmd }];

        switch (trimmed) {
            case 'help':
                newLines.push({ type: 'output', content: 
                    <div className="grid grid-cols-1 gap-1 text-zinc-400">
                        <div><span className="text-white font-bold">about</span>    - View system profile</div>
                        <div><span className="text-white font-bold">skills</span>   - List technical capabilities</div>
                        <div><span className="text-white font-bold">contact</span>  - Initialize communication</div>
                        <div><span className="text-white font-bold">uptime</span>   - Show session duration</div>
                        <div><span className="text-white font-bold">clear</span>    - Clear terminal buffer</div>
                        <div><span className="text-white font-bold">exit</span>     - Close terminal session</div>
                    </div>
                });
                break;
            case 'about':
                newLines.push({ type: 'output', content: 'System Architect specializing in high-frequency trading systems, distributed IoT networks, and zero-knowledge security protocols.' });
                break;
            case 'skills':
                newLines.push({ type: 'output', content: '[RUST] [GO] [KUBERNETES] [TERRAFORM] [AWS] [GRPC] [POSTGRESQL]' });
                break;
            case 'contact':
                newLines.push({ type: 'output', content: 'Opening mail client...' });
                setTimeout(() => window.location.href = 'mailto:hello@example.com', 1000);
                break;
            case 'uptime':
                const now = new Date();
                const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                newLines.push({ type: 'output', content: `Session active for: ${diff} seconds` });
                break;
            case 'whoami':
                newLines.push({ type: 'output', content: 'guest_user (limited access)' });
                break;
            case 'sudo':
                newLines.push({ type: 'output', content: <span className="text-red-500 font-bold">PERMISSION DENIED. Nice try.</span> });
                break;
            case 'clear':
                setLines([{ type: 'system', content: 'Buffer cleared.' }]);
                setInput('');
                return;
            case 'exit':
                onClose();
                setInput('');
                return;
            case '':
                break;
            default:
                newLines.push({ type: 'output', content: `Command not found: ${trimmed}` });
        }

        setLines(prev => [...prev, ...newLines]);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono text-sm h-[500px] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-700 select-none">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer" onClick={onClose} />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-zinc-400 text-xs">guest@ark-system:~</div>
                    <div className="w-10"></div>
                </div>

                {/* Body */}
                <div 
                    className="flex-1 p-4 overflow-y-auto text-zinc-300 custom-scrollbar" 
                    onClick={() => !isBooting && inputRef.current?.focus()}
                >
                    {lines.map((line, i) => (
                        <div key={i} className="mb-1">
                            {line.type === 'input' && (
                                <div className="flex gap-2">
                                    <span className="text-green-500">➜</span>
                                    <span className="text-blue-400">~</span>
                                    <span className="text-white">{line.content}</span>
                                </div>
                            )}
                            {line.type === 'output' && (
                                <div className="pl-6 text-zinc-300 whitespace-pre-wrap">{line.content}</div>
                            )}
                            {line.type === 'system' && (
                                <div className="text-zinc-500 italic"># {line.content}</div>
                            )}
                            {line.type === 'boot' && (
                                <div className="text-zinc-400 text-xs">
                                    <span className="text-green-600">[OK]</span> {line.content}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Input Line - Only show after boot */}
                    {!isBooting && (
                        <div className="flex gap-2 items-center mt-2">
                            <span className="text-green-500">➜</span>
                            <span className="text-blue-400">~</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCommand(input);
                                }}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-600"
                                autoFocus
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
};