import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, AlertCircle, Send, User, Calendar, FileText, ChevronRight } from 'lucide-react'
import { aiService } from '../services/aiService'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../contexts/LanguageContext'

const HealthCheck = () => {
    // We are temporarily not using 't' since we have hardcoded English mock text for this new feature
    // const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        age: '',
        gender: 'Male',
        symptoms: '',
        existingConditions: ''
    })

    const text = {
        title: "Health Triage",
        subtitle: "AI-Powered Symptom Checker",
        desc: "Enter your symptoms below to get an instant AI assessment. This tool helps you decide if you need to see a doctor immediately.",
        age: "Age",
        gender: "Gender",
        symptoms: "Describe your symptoms",
        conditions: "Existing Medical Conditions (Optional)",
        submit: "Analyze Symptoms",
        analyzing: "Analyzing...",
        resultTitle: "Health Assessment",
        disclaimer: "This is an AI-generated assessment and does not replace professional medical advice. In case of emergency, call 108 immediately."
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.symptoms || !formData.age) return

        setLoading(true)
        setResult(null)

        try {
            const response = await aiService.analyzeSymptoms(
                formData.symptoms,
                formData.age,
                formData.gender,
                formData.existingConditions
            )
            setResult(response.content)
        } catch (error) {
            console.error('Health check error:', error)
            setResult('Sorry, I am unable to analyze your symptoms at the moment. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 overflow-y-auto">
            {/* Header - Aligned with Orange Theme */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 pt-8 pb-16 px-4 shadow-xl">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center space-x-4 mb-3">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">{text.title}</h1>
                            <p className="text-orange-100 font-medium text-lg opacity-90">{text.subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Form Section */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 overflow-hidden border border-orange-100"
                        >
                            <div className="bg-orange-50/50 p-6 border-b border-orange-100">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-orange-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    Patient Details
                                </h2>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{text.age}</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                                <input
                                                    type="number"
                                                    name="age"
                                                    value={formData.age}
                                                    onChange={handleInputChange}
                                                    placeholder="45"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl focus:ring-0 transition-all font-semibold text-gray-800 placeholder-gray-400 hover:bg-gray-100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{text.gender}</label>
                                            <div className="relative">
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl focus:ring-0 transition-all font-semibold text-gray-800 hover:bg-gray-100 appearance-none"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                    <ChevronRight className="h-4 w-4 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{text.symptoms}</label>
                                        <div className="relative group">
                                            <textarea
                                                name="symptoms"
                                                value={formData.symptoms}
                                                onChange={handleInputChange}
                                                placeholder="e.g. High fever for 3 days, severe headache on right side..."
                                                required
                                                rows={4}
                                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl focus:ring-0 transition-all text-gray-800 placeholder-gray-400 resize-none hover:bg-gray-100 leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{text.conditions}</label>
                                        <textarea
                                            name="existingConditions"
                                            value={formData.existingConditions}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Diabetes Type 2, Hypertension..."
                                            rows={2}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl focus:ring-0 transition-all text-gray-800 placeholder-gray-400 resize-none hover:bg-gray-100"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                {text.analyzing}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                                {text.submit}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="h-full"
                        >
                            {result ? (
                                <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden h-full flex flex-col relative">
                                    {/* Decorative background pattern */}
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Activity className="w-64 h-64 text-orange-500" />
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex items-center justify-between relative z-10">
                                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mr-3 text-orange-600 shadow-sm">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            {text.resultTitle}
                                        </h2>
                                        <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider border border-green-200 shadow-sm">
                                            AI Analysis Complete
                                        </span>
                                    </div>

                                    <div className="p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                                        <div className="prose prose-orange max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-orange-700 mt-8 mb-4 flex items-center" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="space-y-3 mb-6" {...props} />,
                                                    li: ({ node, ...props }) => (
                                                        <li className="flex items-start text-gray-700" {...props}>
                                                            <span className="mr-3 mt-2 w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 shadow-sm" />
                                                            <span className="flex-1 leading-relaxed">{props.children}</span>
                                                        </li>
                                                    ),
                                                    p: ({ node, ...props }) => <p className="text-gray-600 leading-7 mb-4" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 bg-orange-50 px-1 rounded" {...props} />,
                                                }}
                                            >
                                                {result}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="mt-8 p-5 bg-red-50 rounded-2xl border border-red-100 flex items-start shadow-sm">
                                            <div className="p-2 bg-red-100 rounded-lg mr-4 flex-shrink-0">
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">Important Disclaimer</h4>
                                                <p className="text-sm text-red-700 leading-relaxed opacity-90">
                                                    {text.disclaimer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-gray-100 p-8 h-full flex flex-col items-center justify-center text-center min-h-[500px] relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none" />

                                    <div className="relative z-10 w-full max-w-lg mx-auto">
                                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-50 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner">
                                            <Heart className="w-10 h-10 text-orange-500" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Analyze</h3>
                                        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                                            Our AI-powered system will analyze your symptoms to provide immediate preliminary guidance and emergency assessment.
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-white border border-gray-100 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Activity className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">Symptom Check</h4>
                                                <p className="text-sm text-gray-500">Analysis of potential causes</p>
                                            </div>
                                            <div className="p-5 bg-white border border-gray-100 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">Emergency Level</h4>
                                                <p className="text-sm text-gray-500">Urgency assessment</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HealthCheck
