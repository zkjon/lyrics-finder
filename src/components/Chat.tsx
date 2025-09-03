import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

export default function Chat() {
	const [inputValue, setInputValue] = useState('');
	const [lyrics, setLyrics] = useState<string[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		setIsSearching(true);
		setLyrics([]);

		// Extraer artista y título del input (formato: "Artista - Título")
		const [artist, title] = inputValue.split("-").map(str => str.trim());
		if (!artist || !title) {
			setLyrics(["❌ Please enter in format: Artist - Title"]);
			setIsSearching(false);
			return;
		}

		try {
			const res = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
			if (!res.ok) {
				setLyrics(["❌ Lyrics not found or error searching."]);
			} else {
				const data = await res.json();
				if (data.lyrics) {
					setLyrics(data.lyrics.split('\n').filter((line: string) => line.trim() !== ""));
				} else {
					setLyrics(["❌ No lyrics found for this song."]);
				}
			}
		} catch (err) {
			setLyrics(["❌ Error connecting to lyrics API."]);
		}
		setIsSearching(false);
	};

	return (
		<div className="w-full max-w-3xl mx-auto min-h-[60vh] flex flex-col">
			{/* Header */}
			<header className="py-10 px-5 text-center">
				<h2 className="text-white m-0 text-4xl font-normal leading-tight">Write your song lyrics</h2>
			</header>

			{/* Content Area */}
			<div className="flex-1 py-10 px-5 flex items-center justify-center min-h-[200px]">
				{lyrics.length === 0 && !isSearching ? (
					<div className="text-center text-gray-400">
						<div className="text-5xl mb-6 opacity-60">🎵</div>
						<p className="m-0 text-lg text-gray-500">Write the name of a song or part of the lyrics</p>
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
								<p>Searching for lyrics...</p>
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
			<form onSubmit={handleSubmit} className="px-5 pb-10">
				<div className="max-w-3xl mx-auto">
					<div className="relative flex items-center bg-neutral-800 border border-neutral-600 rounded-[27px] py-3 px-4 transition-colors focus-within:border-neutral-500">
						<svg className="text-gray-400 mr-3 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
						</svg>
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
							placeholder="Write lyrics here..."
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