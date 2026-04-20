document.addEventListener('DOMContentLoaded', () => {
    
    // Data definition
    const activitiesData = [
        {
            id: 'trampoline',
            title: 'Trampoline Park',
            image: 'assets/trampoline_park.png',
            points: ['Gravity-defying fun', 'Dodgeball & foam pits', 'High energy vibe'],
            video: 'https://www.youtube.com/embed/5aL-00kixK4', 
            votes: 2
        },
        {
            id: 'arcade',
            title: 'Retro Arcade',
            image: 'assets/arcade.png',
            points: ['Classic cabinets', 'Modern neon aesthetic', 'Competitive high scores'],
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
            votes: 5
        },
        {
            id: 'ps5',
            title: 'PS5 Gaming Lounge',
            image: 'assets/ps5_gaming.png',
            points: ['Cozy luxury vibe', 'Multiplayer action', 'Chill and play'],
            video: 'https://www.youtube.com/embed/LXb3EKWsInQ',
            votes: 4
        },
        {
            id: 'bowling',
            title: 'Neon Bowling',
            image: 'assets/bowling.png',
            points: ['Glow in the dark lanes', 'Drinks & music', 'Casual competition'],
            video: 'https://www.youtube.com/embed/9bZkp7q19f0',
            votes: 3
        },
        {
            id: 'vr',
            title: 'VR Zombie Game',
            image: 'assets/vr_zombie.png',
            points: ['Fully immersive', 'Co-op survival', 'Adrenaline rush'],
            video: 'https://www.youtube.com/embed/tPIXceWBMFA',
            votes: 1
        },
        {
            id: 'shooting',
            title: 'Sci-Fi Laser Tag',
            image: 'assets/shooting_game.png',
            points: ['Tactical gameplay', 'Fog & neon lasers', 'Action-packed'],
            video: 'https://www.youtube.com/embed/ScMzIvxBSi4',
            votes: 0
        }
    ];

    let userVoted = new Set(); // Track user's votes locally

    // DOM Elements
    const activitiesContainer = document.getElementById('activities');
    const modal = document.getElementById('activity-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('close-modal');
    const modalContent = document.getElementById('modal-content');
    
    // Idea submission
    const ideaInput = document.getElementById('idea-input');
    const submitIdeaBtn = document.getElementById('submit-idea');
    const ideaStatus = document.getElementById('idea-status');

    // Render Cards
    function renderCards() {
        activitiesContainer.innerHTML = '';
        activitiesData.sort((a,b) => b.votes - a.votes).forEach(activity => {
            const card = document.createElement('div');
            card.className = 'activity-card glass';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.onclick = () => openModal(activity);
            card.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') openModal(activity); };

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${activity.image}" alt="${activity.title} image" loading="lazy" />
                </div>
                <div class="card-content">
                    <h3>${activity.title}</h3>
                    <div class="votes-badge">
                        <span>👍</span> <span id="vote-count-${activity.id}">${activity.votes}</span>
                    </div>
                </div>
            `;
            activitiesContainer.appendChild(card);
        });
    }

    // Modal Logic
    function openModal(activity) {
        document.body.style.overflow = 'hidden'; // prevent background scrolling
        
        const isVoted = userVoted.has(activity.id);
        const btnClass = isVoted ? 'vote-btn voted' : 'vote-btn';
        const btnText = isVoted ? 'Voted 👍' : 'Vote for this plan';

        modalContent.innerHTML = `
            <div class="sheet-scroll-content">
                <img src="${activity.image}" alt="${activity.title}" class="modal-header-img" loading="lazy">
                <h2 class="modal-title">${activity.title}</h2>
                
                <ul class="bullets">
                    ${activity.points.map(p => `<li>${p}</li>`).join('')}
                </ul>

                <div class="video-wrapper">
                    <iframe src="${activity.video}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>

                <button class="${btnClass}" id="modal-vote-btn" data-id="${activity.id}" aria-label="Vote for ${activity.title}">
                    ${btnText}
                </button>
                <div style="height: 48px;"></div> <!-- Safe spacing -->
            </div>
        `;

        modal.classList.add('active');
        overlay.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');

        // Bind vote button immediately
        const voteBtn = document.getElementById('modal-vote-btn');
        voteBtn.addEventListener('click', () => toggleVote(activity.id, voteBtn));
    }

    function closeModal() {
        document.body.style.overflow = ''; 
        modal.classList.remove('active');
        overlay.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        
        // Remove iframe src to stop video playing in background
        setTimeout(() => {
            modalContent.innerHTML = '';
        }, 300); // Wait for transition
    }

    function toggleVote(id, btnElement) {
        const activity = activitiesData.find(a => a.id === id);
        if (!activity) return;

        if (userVoted.has(id)) {
            userVoted.delete(id);
            activity.votes--;
            btnElement.className = 'vote-btn';
            btnElement.innerHTML = 'Vote for this plan';
        } else {
            userVoted.add(id);
            activity.votes++;
            btnElement.className = 'vote-btn voted';
            btnElement.innerHTML = 'Voted 👍';
            
            // Add slight pop animation to button
            btnElement.style.transform = 'scale(0.95)';
            setTimeout(() => { btnElement.style.transform = 'scale(1)'; }, 150);
        }

        // Update the card count in the background list
        const cardCount = document.getElementById(`vote-count-${id}`);
        if (cardCount) {
            cardCount.innerText = activity.votes;
        }
    }

    // Idea Submission Logic
    submitIdeaBtn.addEventListener('click', submitIdea);
    ideaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitIdea();
    });

    function submitIdea() {
        const val = ideaInput.value.trim();
        if (val) {
            // Mock submission
            ideaInput.value = '';
            ideaStatus.textContent = 'Thanks! Your idea has been added.';
            ideaStatus.classList.add('show');
            setTimeout(() => {
                ideaStatus.classList.remove('show');
            }, 3000);
        }
    }

    // Event Listeners
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Add swipe down to close sheet
    let touchStartY = 0;
    let touchEndY = 0;
    
    modal.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    modal.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        if (touchEndY - touchStartY > 100) { // swipe down threshold
            // ensure they are swiping from the top handle, or document is at top
            const scrollContent = document.querySelector('.sheet-scroll-content');
            if (!scrollContent || scrollContent.scrollTop === 0) {
                closeModal();
            }
        }
    }, { passive: true });

    // Initial render
    renderCards();
});
