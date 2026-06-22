import { useState, useEffect, type FormEvent } from 'react';
import './App.css';
import sampleAnimeList from './sample-anime.json';

// TypeScript Interfaces matching the backend entities
interface Character {
  id: number;
  name: string;
  image: string | null;
}

interface Anime {
  id: number;
  titleRomaji: string;
  titleEnglish: string | null;
  season: string | null;
  seasonYear: number | null;
  description: string | null;
  characters: Character[];
}

// API endpoint URL configuration
const API_BASE_URL = import.meta.env.ANIME_API_URL || 'http://localhost:5001';





export default function App() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(true);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [characterPage, setCharacterPage] = useState<number>(1);
  const [hasMoreCharacters, setHasMoreCharacters] = useState<boolean>(false);
  const [loadingMoreCharacters, setLoadingMoreCharacters] = useState<boolean>(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  // Modal and HPA states
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
  const [sampleSearchQuery, setSampleSearchQuery] = useState<string>('');
  const [hpaLoadActive, setHpaLoadActive] = useState<boolean>(false);
  const [hpaLoading, setHpaLoading] = useState<boolean>(false);

  // Fetch cached list and HPA status on component mount
  useEffect(() => {
    fetchCachedAnime();
    fetchHpaStatus();
  }, []);

  const fetchHpaStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/load`);
      if (res.ok) {
        const data = await res.json();
        setHpaLoadActive(data.active);
      }
    } catch (err) {
      console.error('Failed to fetch HPA status:', err);
    }
  };

  const handleToggleHpaLoad = async () => {
    setHpaLoading(true);
    const nextState = !hpaLoadActive;
    try {
      const res = await fetch(`${API_BASE_URL}/api/load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: nextState })
      });
      if (!res.ok) {
        throw new Error('Failed to toggle HPA load simulation.');
      }
      const data = await res.json();
      setHpaLoadActive(data.active);
      showStatus(
        data.active
          ? '🔥 HPA CPU Load Simulation activated! Backend container is under heavy load simulation.'
          : '❄️ HPA CPU Load Simulation stopped.',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || 'Error communicating with HPA service.', 'error');
    } finally {
      setHpaLoading(false);
    }
  };

  // Filter sample anime list based on query
  const filteredSamples = sampleAnimeList
    .filter(sample => {
      const query = sampleSearchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        sample.id.toString().includes(query) ||
        sample.name.toLowerCase().includes(query)
      );
    })
    .slice(0, 100);

  const fetchCachedAnime = async () => {
    try {
      setListLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/anime`);
      if (!res.ok) {
        throw new Error('Failed to retrieve anime database.');
      }
      const data = await res.json();
      // Sort by cached order or ID descending
      const sorted = (data as Anime[]).sort((a, b) => b.id - a.id);
      setAnimes(sorted);
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || 'Error connecting to the backend service.', 'error');
    } finally {
      setListLoading(false);
    }
  };

  const showStatus = (message: string, type: 'success' | 'error') => {
    setStatus({ message, type });
    // Automatically clear status notification after 5 seconds
    setTimeout(() => {
      setStatus(prev => prev.message === message ? { message: '', type: null } : prev);
    }, 5000);
  };

  const handleFetchAnime = async (id: number) => {
    if (!id || isNaN(id) || id <= 0) {
      showStatus('Please enter a valid AniList Anime ID (positive number).', 'error');
      return;
    }

    setLoading(true);
    showStatus(`Contacting AniList API to fetch and cache Anime ID ${id}...`, 'success');

    try {
      const res = await fetch(`${API_BASE_URL}/api/anime/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch Anime ID ${id}.`);
      }
      const fetched: Anime = await res.json();

      // Update state: insert or replace the updated anime
      setAnimes(prev => {
        const filtered = prev.filter(a => a.id !== fetched.id);
        return [fetched, ...filtered];
      });

      showStatus(`Successfully fetched and cached "${fetched.titleEnglish || fetched.titleRomaji}"!`, 'success');
      setSearchId('');
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || `Error fetching Anime ID ${id}.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId.trim());
    handleFetchAnime(id);
  };



  const handleOpenModal = (anime: Anime) => {
    setSelectedAnime(anime);
    setCharacterPage(1);
    setHasMoreCharacters((anime.characters?.length || 0) >= 10);
  };

  const handleCloseModal = () => {
    setSelectedAnime(null);
  };

  const handleLoadMoreCharacters = async () => {
    if (!selectedAnime) return;
    setLoadingMoreCharacters(true);
    try {
      const nextPage = characterPage + 1;
      const res = await fetch(`${API_BASE_URL}/api/anime/${selectedAnime.id}/characters?page=${nextPage}`);
      if (!res.ok) {
        throw new Error('Failed to load more characters.');
      }
      const data = await res.json();
      const newNodes = data.nodes || [];

      const updatedCharacters = [...selectedAnime.characters, ...newNodes];
      const uniqueCharacters = Array.from(new Map(updatedCharacters.map(c => [c.id, c])).values());

      const updatedAnime = {
        ...selectedAnime,
        characters: uniqueCharacters
      };

      setSelectedAnime(updatedAnime);
      setAnimes(prev => prev.map(a => a.id === selectedAnime.id ? updatedAnime : a));

      setCharacterPage(nextPage);
      setHasMoreCharacters(data.hasNextPage && newNodes.length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreCharacters(false);
    }
  };

  // Utility to clean AniList description HTML
  const formatDescription = (htmlText: string | null) => {
    return { __html: htmlText || 'No description available.' };
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-main-row">
          <div>
            <h1>AniCache Hub</h1>
            <p className="subtitle">
              Query the global AniList database by ID. The application fetches, stores, and serves the details from a local persistent database.
            </p>
          </div>
          <div className="header-actions">
            <button
              id="hpa-load-toggle-btn"
              type="button"
              onClick={handleToggleHpaLoad}
              disabled={hpaLoading}
              className={`hpa-toggle-btn ${hpaLoadActive ? 'load-active' : ''}`}
            >
              {hpaLoading ? (
                <div className="loader-spin" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', borderTopColor: '#ffffff' }}></div>
              ) : (
                <span className="hpa-pulse-dot"></span>
              )}
              {hpaLoadActive ? 'HPA Test: Decrease Load' : 'HPA Test: Increase Load'}
            </button>
          </div>
        </div>
      </header>

      {/* Search Console */}
      <section className="glass-panel search-section" id="search-section">
        <div className="search-container">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <svg className="search-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="anime-id-input"
                type="number"
                placeholder="Enter AniList ID (e.g. 1, 21, 15125...)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                disabled={loading}
                className="search-input"
              />
            </div>
            <button
              id="fetch-submit-btn"
              type="submit"
              disabled={loading || !searchId.trim()}
              className="btn-fetch"
            >
              {loading ? <div className="loader-spin"></div> : 'Fetch & Cache'}
            </button>
            <button
              id="browse-samples-btn"
              type="button"
              onClick={() => setShowSampleModal(true)}
              className="btn-browse-samples"
            >
              🔍 Browse Sample IDs
            </button>
          </form>


        </div>
      </section>

      {/* Info Status / Toast Banner */}
      {status.message && (
        <div className={`status-message ${status.type || ''}`} id="status-message-banner">
          <span>{status.type === 'error' ? '❌' : 'ℹ️'}</span>
          <p>{status.message}</p>
        </div>
      )}

      {/* Dashboard Section */}
      <section className="dashboard-section">
        <div className="grid-section-header">
          <h2>Cached Library Database</h2>
          <span className="badge-count" id="cached-count-badge">
            {animes.length} {animes.length === 1 ? 'Anime' : 'Animes'} Cached
          </span>
        </div>
        <br />

        {listLoading ? (
          // Skeletons while loading initially
          <div className="anime-grid">
            {[1, 2, 3].map(n => (
              <div key={n} className="skeleton-card skeleton-shimmer">
                <div className="skeleton-block skeleton-header"></div>
                <div className="skeleton-block skeleton-title"></div>
                <div className="skeleton-block skeleton-subtitle"></div>
                <div className="skeleton-block skeleton-desc"></div>
                <div className="skeleton-block skeleton-footer"></div>
              </div>
            ))}
          </div>
        ) : animes.length === 0 ? (
          // Empty State
          <div className="glass-panel empty-state" id="empty-state-panel">
            <div className="empty-icon animate-float">📦</div>
            <h3>Local Cache is Empty</h3>
            <p className="empty-text">
              Enter an AniList ID above to fetch data from AniList and seed the database.
            </p>
          </div>
        ) : (
          // Anime Grid list
          <div className="anime-grid" id="anime-cards-grid">
            {animes.map(anime => (
              <article
                key={anime.id}
                id={`anime-card-${anime.id}`}
                onClick={() => handleOpenModal(anime)}
                className="anime-card"
              >
                <div className="card-header-row">
                  <span className="card-season">
                    {anime.season || 'UNKNOWN'} {anime.seasonYear || ''}
                  </span>
                  <span className="card-id-badge">ID: {anime.id}</span>
                </div>
                <h3 className="card-title" title={anime.titleEnglish || anime.titleRomaji}>
                  {anime.titleEnglish || anime.titleRomaji}
                </h3>
                {anime.titleEnglish && (
                  <span className="card-romaji">{anime.titleRomaji}</span>
                )}
                <p className="card-description" dangerouslySetInnerHTML={formatDescription(anime.description)}></p>

                <div className="card-footer">
                  <div className="avatar-group">
                    {anime.characters?.slice(0, 4).map(char => (
                      <div key={char.id} className="avatar-wrapper" title={char.name}>
                        <img
                          src={char.image || 'https://via.placeholder.com/150'}
                          alt={char.name}
                          className="avatar-img"
                        />
                      </div>
                    ))}
                    {anime.characters?.length > 4 && (
                      <div className="avatar-plus">
                        +{anime.characters.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="characters-count-tag">
                    {anime.characters?.length || 0} characters
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Details Modal */}
      {selectedAnime && (
        <div
          className="modal-backdrop"
          id="anime-details-modal-backdrop"
          onClick={handleCloseModal}
        >
          <div
            className="modal-content"
            id="anime-details-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="modal-close-btn"
              type="button"
              onClick={handleCloseModal}
              className="modal-close-btn"
              title="Close panel"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-header-simple">
              <h2 className="modal-title-english">
                {selectedAnime.titleEnglish || selectedAnime.titleRomaji}
              </h2>
              {selectedAnime.titleEnglish && (
                <p className="modal-title-romaji">Romaji: {selectedAnime.titleRomaji}</p>
              )}
            </div>

            {/* Modal Body Info */}
            <div className="modal-body">
              {/* Meta metrics grid */}
              <div className="modal-meta-grid">
                <div className="modal-meta-card">
                  <div className="meta-label">AniList ID</div>
                  <div className="meta-value">{selectedAnime.id}</div>
                </div>
                <div className="modal-meta-card">
                  <div className="meta-label">Season</div>
                  <div className="meta-value">{selectedAnime.season || 'Unknown'}</div>
                </div>
                <div className="modal-meta-card">
                  <div className="meta-label">Year</div>
                  <div className="meta-value">{selectedAnime.seasonYear || 'Unknown'}</div>
                </div>
              </div>

              {/* Description Section */}
              <div className="modal-description-section">
                <h4 className="section-label">Synopsis</h4>
                <p
                  className="modal-description"
                  dangerouslySetInnerHTML={formatDescription(selectedAnime.description)}
                ></p>
              </div>

              {/* Characters Section */}
              <div className="modal-characters-section">
                <h4 className="section-label">Characters ({selectedAnime.characters?.length || 0})</h4>
                {selectedAnime.characters && selectedAnime.characters.length > 0 ? (
                  <>
                    <div className="character-avatars-grid">
                      {selectedAnime.characters.map(char => (
                        <div key={char.id} className="character-card">
                          <img
                            src={char.image || 'https://via.placeholder.com/150'}
                            alt={char.name}
                            className="character-avatar-large"
                          />
                          <span className="character-name" title={char.name}>{char.name}</span>
                        </div>
                      ))}
                    </div>
                    {hasMoreCharacters && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
                        <button
                          type="button"
                          id="load-more-chars-btn"
                          onClick={handleLoadMoreCharacters}
                          disabled={loadingMoreCharacters}
                          className="btn-suggest"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                        >
                          {loadingMoreCharacters ? 'Loading...' : 'Load More Characters'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No characters cached for this anime.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample IDs Modal */}
      {showSampleModal && (
        <div
          className="modal-backdrop"
          id="sample-ids-modal-backdrop"
          onClick={() => {
            setShowSampleModal(false);
            setSampleSearchQuery('');
          }}
        >
          <div
            className="modal-content sample-modal-content"
            id="sample-ids-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="sample-modal-close-btn"
              type="button"
              onClick={() => {
                setShowSampleModal(false);
                setSampleSearchQuery('');
              }}
              className="modal-close-btn"
              title="Close panel"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-header-simple">
              <h2 className="modal-title-english">Browse Sample Anime IDs</h2>
              <p className="modal-title-romaji">
                Choose a sample anime from the local configuration to populate the search bar.
              </p>
            </div>

            {/* Modal Search Filter */}
            <div className="sample-modal-search-wrapper">
              <input
                id="sample-search-input"
                type="text"
                placeholder="Filter samples by title or ID..."
                value={sampleSearchQuery}
                onChange={(e) => setSampleSearchQuery(e.target.value)}
                className="sample-search-input"
                autoFocus
              />
            </div>

            {/* Modal Table Body */}
            <div className="modal-body sample-modal-body">
              <div className="table-container">
                <table className="sample-table">
                  <thead>
                    <tr>
                      <th>AniList ID</th>
                      <th>Anime Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSamples.map((sample) => (
                      <tr
                        key={sample.id}
                        onClick={() => {
                          setSearchId(sample.id.toString());
                          setShowSampleModal(false);
                          setSampleSearchQuery('');
                        }}
                        className="sample-table-row"
                      >
                        <td>
                          <span className="sample-id-badge">{sample.id}</span>
                        </td>
                        <td className="sample-name-cell">{sample.name}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-select-sample"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredSamples.length === 0 && (
                      <tr>
                        <td colSpan={3} className="no-samples-found">
                          No matching samples found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sample-modal-footer">
              Showing {filteredSamples.length} of {sampleAnimeList.length} samples (Limited to top 100)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
