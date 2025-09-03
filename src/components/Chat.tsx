import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

interface Suggestion {
	artist: {
		name: string;
	};
	title: string;
}

export default function Chat() {
	const [inputValue, setInputValue] = useState('');
	const [lyrics, setLyrics] = useState<string[]>([]);
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const fetchSuggestions = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		setIsSearching(true);
		setLyrics([]);
		setSuggestions([]);
		setShowSuggestions(true);

		try {
			const res = await fetch(`/api/suggestions?q=${encodeURIComponent(inputValue)}`);
			if (res.ok) {
				const data = await res.json();
				if (data.data && data.data.length > 0) {
					setSuggestions(data.data);
				} else {
					setLyrics(["❌ No suggestions found for your search."]);
					setShowSuggestions(false);
				}
			} else {
				setLyrics(["❌ Error searching for suggestions."]);
				setShowSuggestions(false);
			}
		} catch (err) {
			setLyrics(["❌ API connection error."]);
			setShowSuggestions(false);
		}
		setIsSearching(false);
	};

	const fetchLyrics = async (artist: string, title: string) => {
		setSuggestions([]);
		setShowSuggestions(false);
		setIsSearching(true);
		setLyrics([]);

		try {
			const res = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
			if (res.ok) {
				const data = await res.json();
				if (data.lyrics) {
					setLyrics(data.lyrics.split('\n').filter((line: string) => line.trim() !== ""));
				} else {
					setLyrics(["❌ No lyrics found for this song."]);
				}
			} else {
				setLyrics(["❌ Lyrics not found or search error."]);
			}
		} catch (err) {
			setLyrics(["❌ Lyrics API connection error."]);
		}
		setIsSearching(false);
	};

	return (
		<div className="w-full max-w-3xl mx-auto min-h-[60vh] flex flex-col">
			{/* Header */}
			<header className="py-10 px-5 text-center">
				<h2 className="text-white m-0 text-4xl font-normal leading-tight">Song Lyrics Finder</h2>
			</header>

			{/* Content Area */}
			<div className="flex-1 py-10 px-5 flex items-center justify-center min-h-[200px]">
				{lyrics.length === 0 && suggestions.length === 0 && !isSearching ? (
					<div className="text-center text-gray-400">
						<div className="text-5xl mb-6 opacity-60">🎵</div>
						<p className="m-0 text-lg text-gray-500">Type a song name or part of the lyrics</p>
					</div>
				) : (
					<div className="w-full max-w-2xl">
						{isSearching ? (
							<div className="text-center text-gray-400">
								<div className="flex justify-center gap-1 mb-4">
									<span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }}></span>
									<span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }}></span>
									<span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
								</div>
								<p>{showSuggestions ? 'Searching suggestions...' : 'Searching lyrics...'}</p>
							</div>
						) : showSuggestions && suggestions.length > 0 ? (
							<div className="w-full">
								<h3 className="text-white text-xl mb-4 text-center">Select a song:</h3>
								<ul className="space-y-2">
									{suggestions.map((song, index) => (
										<li 
											key={index}
											className="text-white py-3 px-4 bg-white/5 rounded-lg border border-neutral-600 hover:border-blue-500 hover:bg-white/10 cursor-pointer transition-all duration-200"
											onClick={() => fetchLyrics(song.artist.name, song.title)}
										>
											<span className="font-semibold">{song.title}</span> - <span className="text-gray-300">{song.artist.name}</span>
										</li>
									))}
								</ul>
							</div>
						) : (
							lyrics.map((line, index) => (
								<p key={index} className="text-white my-2 py-3 px-4 bg-white/5 rounded-lg border-l-4 border-blue-500">
									{line}
								</p>
							))
						)}
					</div>
				)}
			</div>

			{/* Input Area */}
			<form onSubmit={fetchSuggestions} className="px-5 pb-10">
				<div className="max-w-3xl mx-auto">
					<div className="relative flex items-center bg-neutral-800 border border-neutral-600 rounded-[27px] py-3 px-4 transition-colors focus-within:border-neutral-500">
						<svg className="text-gray-400 mr-3 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
						</svg>
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
							placeholder="Search for a song..."
							className="flex-1 bg-transparent border-none text-white text-base outline-none placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
							disabled={isSearching}
							id="lyrics-input"
						/>
						<div className="flex gap-2 ml-3">
							<button
								type="button"
								className="px-2 py-1 text-secondary/60 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
								onClick={async () => {
									try {
										const text = await navigator.clipboard.readText();
										setInputValue(text);
									} catch (err) {
										console.error("Failed to read clipboard contents:", err);
									}
								}}
								disabled={isSearching}
								aria-label="Paste from clipboard"
							>
								Paste
							</button>
							<button 
								type="submit" 
								className="px-2 py-1 text-secondary/60 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
								disabled={isSearching}
							>
								{isSearching ? 'Searching...' : 'Search'}
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}