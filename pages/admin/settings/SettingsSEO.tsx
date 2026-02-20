import React, { useMemo, useState } from 'react';
import { Globe, Image, Eye, EyeOff, Link as LinkIcon, RefreshCw, Activity } from 'lucide-react';
import { SystemSettings } from '../../../types';

interface Props {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsSEO: React.FC<Props> = ({ settings, updateSettings }) => {
    const seo = settings.seo || {};
    const [llmSlug, setLlmSlug] = useState('');
    const [llmPreview, setLlmPreview] = useState<any | null>(null);
    const [llmLoading, setLlmLoading] = useState(false);
    const [llmError, setLlmError] = useState('');

    const descriptionLength = (seo.defaultDescription || '').length;
    const descriptionHint =
        descriptionLength === 0
            ? 'Description is empty'
            : descriptionLength < 80
            ? 'Too short for rich snippets'
            : descriptionLength > 180
            ? 'May be truncated in search results'
            : 'Looks good for search';

    const sampleUrl = useMemo(() => {
        return `https://neta.ink`;
    }, []);

    const duplicateTitleWarning =
        (seo.defaultTitle || '').trim().toLowerCase() === 'neta – know your leader';

    const update = (key: keyof NonNullable<SystemSettings['seo']>, value: any) => {
        updateSettings({
            ...settings,
            seo: {
                defaultTitle: seo.defaultTitle,
                defaultDescription: seo.defaultDescription,
                defaultOgImage: seo.defaultOgImage,
                allowIndexing: typeof seo.allowIndexing === 'boolean' ? seo.allowIndexing : true,
                [key]: value
            }
        });
    };

    const testLlmEndpoint = async () => {
        if (!llmSlug.trim()) return;
        setLlmLoading(true);
        setLlmError('');
        setLlmPreview(null);
        try {
            const res = await fetch(`/api/llm/politician/${encodeURIComponent(llmSlug.trim())}`);
            if (!res.ok) {
                setLlmError('Not found or error from API');
                setLlmPreview(null);
            } else {
                const json = await res.json();
                setLlmPreview(json);
            }
        } catch (e) {
            setLlmError('Request failed');
            setLlmPreview(null);
        } finally {
            setLlmLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="text-blue-600" size={22} /> Search & Sharing
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">
                        Control how Neta appears on Google, social media, and LLMs.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Default Title</p>
                            <p className="text-xs text-slate-400">Used on pages without custom titles.</p>
                        </div>
                    </div>
                    <input
                        type="text"
                        className="input-field"
                        value={seo.defaultTitle || ''}
                        onChange={(e) => update('defaultTitle', e.target.value)}
                        placeholder="Neta – Know Your Leader"
                    />
                </div>

                <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Default OG Image URL</p>
                            <p className="text-xs text-slate-400">Used for social cards and link previews.</p>
                        </div>
                        <Image size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="url"
                        className="input-field"
                        value={seo.defaultOgImage || ''}
                        onChange={(e) => update('defaultOgImage', e.target.value)}
                        placeholder="https://neta.ink/og-default.png"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Default Description</p>
                        <p className="text-xs text-slate-400">Shown on search results and social snippets.</p>
                    </div>
                </div>
                <textarea
                    className="input-field min-h-[120px] text-sm leading-relaxed"
                    value={seo.defaultDescription || ''}
                    onChange={(e) => update('defaultDescription', e.target.value)}
                    placeholder="Citizen dashboard for MPs and MLAs with verified criminal records, assets, RTI impact, and open data APIs."
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{descriptionHint}</span>
                    <span>{descriptionLength} characters</span>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[24px] border border-slate-800 p-6 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        {seo.allowIndexing === false ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold">
                            {seo.allowIndexing === false ? 'Indexing disabled' : 'Indexing enabled'}
                        </p>
                        <p className="text-xs text-slate-400">
                            Controls the default robots policy exposed to crawlers and LLMs.
                        </p>
                        <p className="text-[10px] mt-1">
                            Live robots: {seo.allowIndexing === false ? 'noindex, nofollow' : 'index, follow'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => update('allowIndexing', true)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border ${
                            seo.allowIndexing === false
                                ? 'border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700'
                                : 'border-emerald-400 text-emerald-100 bg-emerald-600/80'
                        }`}
                    >
                        Allow indexing
                    </button>
                    <button
                        onClick={() => update('allowIndexing', false)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border ${
                            seo.allowIndexing === false
                                ? 'border-rose-300 text-rose-100 bg-rose-600/80'
                                : 'border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700'
                        }`}
                    >
                        Block indexing
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <LinkIcon size={14} /> Search snippet preview
                            </p>
                            <p className="text-xs text-slate-400">Rough preview of how Google may show the homepage.</p>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1 text-left">
                        <p className="text-[#1a0dab] text-sm font-semibold truncate">
                            {seo.defaultTitle || 'Neta – Know Your Leader'}
                        </p>
                        <p className="text-[#006621] text-xs">{sampleUrl}</p>
                        <p className="text-[#545454] text-xs leading-relaxed line-clamp-2">
                            {seo.defaultDescription ||
                                'Citizen dashboard for MPs and MLAs with verified criminal records, assets, RTI impact, and open data APIs.'}
                        </p>
                    </div>
                    {duplicateTitleWarning && (
                        <p className="text-[11px] text-amber-600 mt-2">
                            Default title matches the homepage. Consider using more specific titles for key sections.
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Image size={14} /> Social card preview
                            </p>
                            <p className="text-xs text-slate-400">How links may appear on WhatsApp, X, and others.</p>
                        </div>
                    </div>
                    <div className="mt-3 border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="h-32 bg-slate-100 flex items-center justify-center">
                            {seo.defaultOgImage ? (
                                <img src={seo.defaultOgImage} alt="OG preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[11px] text-slate-500">No OG image configured</span>
                            )}
                        </div>
                        <div className="p-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">neta.ink</p>
                            <p className="text-xs font-semibold truncate">
                                {seo.defaultTitle || 'Neta – Know Your Leader'}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                                {seo.defaultDescription ||
                                    'Track your MP or MLA with real-time public sentiment, RTI trails, and open data.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Activity size={14} /> LLM endpoint tester
                            </p>
                            <p className="text-xs text-slate-400">Hit the structured JSON API for a politician by slug.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            className="input-field flex-1"
                            placeholder="e.g. rahul-gandhi"
                            value={llmSlug}
                            onChange={(e) => setLlmSlug(e.target.value)}
                        />
                        <button
                            onClick={testLlmEndpoint}
                            disabled={llmLoading || !llmSlug.trim()}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-slate-900 text-slate-50 disabled:bg-slate-400"
                        >
                            {llmLoading ? 'Testing…' : 'Test'}
                        </button>
                    </div>
                    {llmError && <p className="text-[11px] text-rose-600 mt-2">{llmError}</p>}
                    {llmPreview && (
                        <pre className="mt-3 text-[11px] bg-slate-900 text-slate-100 rounded-xl p-3 overflow-auto max-h-48">
                            {JSON.stringify(llmPreview, null, 2)}
                        </pre>
                    )}
                </div>

                <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <RefreshCw size={14} /> Sitemap and robots
                            </p>
                            <p className="text-xs text-slate-400">
                                Quick links for search diagnostics and cache refresh.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <a
                            href="/sitemap.xml"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
                        >
                            Open sitemap.xml
                        </a>
                        <a
                            href="/robots.txt"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
                        >
                            Open robots.txt
                        </a>
                        <a
                            href="https://search.google.com/search-console"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
                        >
                            Open Search Console
                        </a>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                        The sitemap and robots files are generated dynamically from current settings and data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsSEO;
