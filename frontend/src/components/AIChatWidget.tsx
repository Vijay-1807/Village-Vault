import { useState, useRef, useEffect } from 'react'
import { aiService } from '../services/aiService'
import { Send, Bot, Loader2, X, Minimize2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Namaste! I\'m your VillageVault AI assistant. How can I help you regarding the village today?',
            timestamp: new Date()
        }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentModel] = useState(aiService.getCurrentModel())
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100)
        }
    }, [messages, isOpen])

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)

        try {
            const response = await aiService.chat(inputMessage.trim())

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('AI chat error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I\'m having trouble connecting to the village network. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const quickActions = [
        { label: '🚑 Emergency', query: 'Emergency help guide' },
        { label: '🌦️ Weather', query: 'Current weather precautions' },
        { label: '🌾 Farming', query: 'Farming tips for this season' },
        { label: '🏥 Health', query: 'Common health tips' }
    ]

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen
                    ? 'bg-red-500 hover:bg-red-600 rotate-90 transform'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 animate-bounce-subtle'
                    }`}
                aria-label="Toggle AI Chat"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Bot className="w-8 h-8 text-white" />
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed z-40 transition-all duration-300 ease-in-out transform origin-bottom-right ${isOpen
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
                    } bottom-24 right-4 w-[90vw] sm:w-[380px] h-[75vh] sm:h-[600px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden font-sans`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 flex items-center justify-between shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-wide flex items-center gap-2">
                                Village Assistant
                                <Sparkles className="w-3 h-3 text-yellow-300" />
                            </h3>
                            <p className="text-orange-50 text-xs flex items-center gap-1.5 opacity-90">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                </span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 pt-6 bg-gray-50 space-y-4 scroll-smooth">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}
                            >
                                <div className="markdown-body font-medium">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li className="mb-0.5">{children}</li>,
                                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-1">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>,
                                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                            blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 pl-2 italic my-1">{children}</blockquote>,
                                            code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                <div className={`text-[10px] mt-1.5 text-right ${msg.role === 'user' ? 'text-orange-100' : 'text-gray-400'
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                <span className="text-sm text-gray-500 font-medium">Village Assistant is typing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto">
                    <div className="flex gap-2 pb-1">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInputMessage(action.query)}
                                className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-full transition-all border border-orange-100 hover:border-orange-200 hover:shadow-sm"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask anything..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 transition-all outline-none font-medium"
                            disabled={isLoading}
                            style={{ color: '#000000' }} // Explicitly forcing black color
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="p-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AIChatWidget
