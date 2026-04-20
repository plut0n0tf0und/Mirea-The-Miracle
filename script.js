import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://geclrzxwjxlwddifqihl.supabase.co';
const supabaseAnonKey = 'sb_publishable_x99tWk_zuqFao8YkR3oTaA_h6k-9bqf';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Data definition
let activitiesData = [
    { 
        id: 'trampoline', 
        title: 'Airborne Trampoline Park', 
        image: 'assets/trampoline_card.png', 
        vibe: 'Defy gravity and embrace your inner bouncy ball.',
        priceInfo: '₹300 (30m Weekday) | ₹400 (30m Weekend)',
        points: ['Defy gravity and embrace your inner bouncy ball.', 'Price: ₹300 (30m Weekday) | ₹400 (30m Weekend)'], 
        video: 'https://www.youtube.com/embed/o_NqfV14Hp4' 
    },
    { 
        id: 'arcade', 
        title: 'Retro Arcade (Timezone)', 
        image: 'assets/arcade_card.png', 
        vibe: 'Mash buttons like it’s 1999 and win tickets you’ll probably lose.',
        priceInfo: 'Reloadable cards from ₹600 (Pay-per-game)',
        points: ['Mash buttons like it’s 1999 and win tickets you’ll probably lose.', 'Price: Reloadable cards starting at ₹600 (Pay-per-game).'], 
        video: 'https://www.youtube.com/embed/ArYMh1JqOxg' 
    },
    { 
        id: 'ps5_gaming', 
        title: 'PS5 Gaming Lounge', 
        image: 'assets/ps5_lounge_card.png', 
        vibe: 'For when your mom says "stop gaming" so you go to the mall to game more.',
        priceInfo: '₹100 (1hr) - ₹700 (10hr)',
        points: ['For when your mom says "stop gaming" so you go to the mall to game more.', '₹100 (1hr), ₹400 (5hr), ₹500 (7hr), ₹700 (10hr), Controller ₹150'], 
        video: 'https://www.youtube.com/embed/HB3BhgVt1EQ' 
    },
    { 
        id: 'bowling', 
        title: 'Neon Bowling', 
        image: 'assets/bowling_card.png', 
        vibe: 'Look cool under glow-lights until you throw a gutter ball.',
        priceInfo: '₹250 (~24 racks)',
        points: ['Look cool under glow-lights until you throw a gutter ball.', 'Price: ₹250 (~24 racks)'], 
        video: 'https://www.youtube.com/embed/ua-EMXEId2A' 
    },
    { 
        id: 'vr_shooter', 
        title: 'VR Zombie Game', 
        image: 'assets/vr_shooter_card.png', 
        vibe: 'Scream in public while fighting imaginary monsters. High-key embarrassing, low-key fun.',
        priceInfo: '₹250 per session',
        points: ['Scream in public while fighting imaginary monsters.', 'High-key embarrassing, low-key fun.', 'Price: ₹250 per session'], 
        video: 'https://www.youtube.com/embed?listType=search&list=VR+shooting+game' 
    },
    { 
        id: 'laser_tag', 
        title: 'Sci-Fi Laser Tag', 
        image: 'assets/lasertag_card.png', 
        vibe: "Sweat buckets while pretending you're in Star Wars.",
        priceInfo: '₹250 - ₹350 per round',
        points: ["Sweat buckets while pretending you're in Star Wars.", 'Price: ₹250 - ₹350 per round'], 
        video: 'https://www.youtube.com/embed/ihitinFGeyA' 
    }
];

const state = {
    user: null,
    pollId: 'trip_main',
    votes: {},     // activityId => count
    hasVotedFor: null,
    comments: []
};

// ------ TELEGRAM NOTIFICATIONS ------
const TELEGRAM_BOT_TOKEN = '8771270378:AAHeagqdOyqmoUbecG-YqBzV_pxUTL6w778';
const TELEGRAM_CHAT_ID = '1614415578';

async function notifyTelegram(message) {
    if(!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') return;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        }).catch(err => console.error("Telegram ping error:", err)); // Non-blocking
    } catch(e) { } // silent fail
}

document.addEventListener('DOMContentLoaded', () => {
    initUser();
});

function initUser() {
    const stored = localStorage.getItem('trip_user');
    if (stored) {
        state.user = JSON.parse(stored);
        initApp();
    } else {
        if (!sessionStorage.getItem('trip_anon_ping')) {
            sessionStorage.setItem('trip_anon_ping', 'true');
            notifyTelegram(`👻 <b>Anonymous Lurker Alert!</b>\nSomeone just opened the trip link but hasn't entered their name yet...`);
        }
        showUserModal();
    }
}

function showUserModal() {
    const modal = document.getElementById('user-modal');
    const overlay = document.getElementById('user-overlay');
    const input = document.getElementById('username-input');
    const img = document.getElementById('avatar-img');
    const btn = document.getElementById('join-btn');

    modal.classList.add('active');
    overlay.classList.add('active');

    input.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Guest';
        img.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(val)}&backgroundColor=transparent`;
    });

    btn.addEventListener('click', () => {
        let name = input.value.trim() || 'Guest';
        const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        state.user = {
            id: crypto.randomUUID(),
            name,
            avatar: img.src,
            color
        };
        localStorage.setItem('trip_user', JSON.stringify(state.user));
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
        
        // Let CSS transition finish before hiding completely
        setTimeout(() => {
            modal.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            initApp();
            notifyTelegram(`👀 <b>New Visitor Logged In!</b>\nName: ${state.user.name}`);
        }, 300);
    });
}

function initApp() {
    renderCards();
    setupModals();
    setupSuggestModal();
    setupComments();
    
    listenToVotes();
    listenToSuggestions();
    listenToComments();
}

// ------ POLL SYSTEM ------

async function fetchVotes() {
    const { data: votes, error } = await supabase
        .from('votes')
        .select('*')
        .eq('pollId', state.pollId);

    if (error) {
        console.error("Error fetching votes", error);
        return;
    }

    const optionVotes = {};
    let myVote = null;

    votes.forEach(data => {
        if (!optionVotes[data.optionId]) optionVotes[data.optionId] = [];
        optionVotes[data.optionId].push(data);
        
        if(data.userId === state.user?.id) {
            myVote = data.optionId;
        }
    });

    state.votes = optionVotes;
    state.hasVotedFor = myVote;
    
    updateCardsVoteCounts();
    updateModalVoteBtn();
}

function listenToVotes() {
    fetchVotes();
    
    // Subscribe to realtime database changes for votes
    supabase
        .channel('votes-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, payload => {
            // For simplicity and to avoid race conditions with counts, we re-fetch when changes occur.
            // In a highly active prod app you'd optimize this with delta patching locally.
            fetchVotes(); 
        })
        .subscribe();
}

function updateCardsVoteCounts() {
    activitiesData.forEach(activity => {
        const el = document.getElementById(`vote-count-${activity.id}`);
        const voters = state.votes[activity.id] || [];
        const newCount = voters.length;
        
        if(el) {
            if (el.innerText !== String(newCount)) {
                el.style.transform = 'scale(1.2)';
                el.style.color = 'var(--accent)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.color = '';
                }, 300);
            }
            el.innerText = newCount;
        }

        const stackEl = document.getElementById(`stack-${activity.id}`);
        if(stackEl) {
            let html = '';
            const visible = voters.slice(0, 4);
            const remaining = newCount - visible.length;
            
            visible.forEach((v, index) => {
                const isMe = v.userId === state.user?.id;
                const avatar = v.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(v.userName || v.userId)}&backgroundColor=transparent`;
                html += `<div class="voter-avatar ${isMe ? 'own-vote' : ''}" style="z-index: ${10-index}; animation-delay: ${index * 0.05}s;" data-name="${escapeHtml(v.userName || 'User')}"><img src="${avatar}" alt="voter"></div>`;
            });
            
            if(remaining > 0) {
                html += `<div class="voter-avatar more-voters" style="z-index: 0;">+${remaining}</div>`;
            }
            stackEl.innerHTML = html;
        }

        const badge = document.getElementById(`badge-${activity.id}`);
        if(badge) {
            const icon = badge.querySelector('.vote-icon');
            if(state.hasVotedFor === activity.id) {
                badge.style.backgroundColor = 'var(--accent)';
                badge.style.color = '#fff';
                if(icon) icon.innerText = 'Voted';
            } else if (state.hasVotedFor) {
                badge.style.opacity = '0.5';
                if(icon) icon.innerText = 'Click to vote';
            } else {
                badge.style.backgroundColor = '';
                badge.style.color = '';
                badge.style.opacity = '1';
                if(icon) icon.innerText = 'Click to vote';
            }
        }
    });
}

function renderCards() {
    const activitiesContainer = document.getElementById('activities');
    activitiesContainer.innerHTML = '';
    
    activitiesData.forEach(activity => {
        const voters = state.votes[activity.id] || [];
        const count = voters.length;
        const card = document.createElement('div');
        card.className = 'activity-card glass';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        
        // Clicking the main card opens the modal
        card.onclick = () => openActivityModal(activity);
        card.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') openActivityModal(activity); };

        let suggestTag = activity.suggestedBy ? `<p style="font-size: 0.75rem; color: var(--text-light); margin-top: 4px;">Suggested by ${escapeHtml(activity.suggestedBy)}</p>` : '';
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${activity.image}" alt="${activity.title} image" loading="lazy" style="object-fit: cover; width: 100%; height: 100%;" />
            </div>
            <div class="card-content">
                <h3>${activity.title}</h3>
                <p class="card-vibe">${activity.vibe}</p>
                <p class="card-price">${activity.priceInfo}</p>
                ${suggestTag}
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;">
                    <button class="votes-badge" id="badge-${activity.id}" aria-label="Vote for ${activity.title}">
                        <span class="vote-icon">Click to vote</span> 
                        <span id="vote-count-${activity.id}" style="transition: all 0.3s; margin-left: 4px;">${count}</span>
                    </button>
                    <div class="voter-stack" id="stack-${activity.id}">
                        <!-- avatars injected here -->
                    </div>
                </div>
            </div>
        `;
        activitiesContainer.appendChild(card);
        
        // Prevent click bubbling and trigger vote directly when clicking the badge
        const badge = card.querySelector('.votes-badge');
        if(badge) {
            badge.onclick = (e) => {
                e.stopPropagation(); // prevent opening modal
                castVote(activity.id);
            };
        }
    });
}

// ------ ACTIVITY MODALS ------

const modal = document.getElementById('activity-modal');
const overlay = document.getElementById('modal-overlay');
const closeBtn = document.getElementById('close-modal');
const modalContent = document.getElementById('modal-content');
let currentActivityId = null;

function setupModals() {
    closeBtn.addEventListener('click', closeActivityModal);
    overlay.addEventListener('click', closeActivityModal);
    
    let touchStartY = 0;
    let touchEndY = 0;
    
    modal.addEventListener('touchstart', e => { touchStartY = e.changedTouches[0].screenY; }, { passive: true });
    modal.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        if (touchEndY - touchStartY > 100) {
            const scrollContent = document.querySelector('.sheet-scroll-content');
            if (!scrollContent || scrollContent.scrollTop === 0) closeActivityModal();
        }
    }, { passive: true });
}

function openActivityModal(activity) {
    currentActivityId = activity.id;
    document.body.style.overflow = 'hidden'; 
    
    modalContent.innerHTML = `
        <div class="sheet-scroll-content">
            <img src="${activity.image}" alt="${activity.title}" class="modal-header-img" loading="lazy">
            <h2 class="modal-title">${activity.title}</h2>
            
            <ul class="bullets">
                ${activity.points.map(p => `<li>${p}</li>`).join('')}
            </ul>

            ${activity.video ? `
            <div class="video-wrapper">
                <iframe src="${activity.video}" title="YouTube video player" allowfullscreen></iframe>
            </div>` : ''}

            <button class="vote-btn" id="modal-vote-btn" aria-label="Vote for ${activity.title}">
                Loading...
            </button>
            <div style="height: 48px;"></div>
        </div>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');

    updateModalVoteBtn();

    const voteBtn = document.getElementById('modal-vote-btn');
    voteBtn.addEventListener('click', () => castVote(activity.id));
}

function closeActivityModal() {
    document.body.style.overflow = ''; 
    modal.classList.remove('active');
    overlay.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    currentActivityId = null;
    
    setTimeout(() => { modalContent.innerHTML = ''; }, 300); 
}

function updateModalVoteBtn() {
    const btn = document.getElementById('modal-vote-btn');
    if(!btn || !currentActivityId) return;

    if (state.hasVotedFor === currentActivityId) {
        btn.className = 'vote-btn voted';
        btn.innerHTML = 'You Voted This 👍';
        btn.disabled = true; 
    } else if (state.hasVotedFor) {
        btn.className = 'vote-btn';
        btn.innerHTML = 'You voted for another option';
        btn.disabled = true;
        btn.style.opacity = '0.5';
    } else {
        btn.className = 'vote-btn';
        btn.innerHTML = 'Vote for this plan';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

async function castVote(optionId) {
    if (state.hasVotedFor) {
        if (state.hasVotedFor === optionId) {
            // Unvote Logic
            const badgeElement = document.getElementById(`badge-${optionId}`);
            if (badgeElement) {
                badgeElement.style.transform = 'scale(0.95)';
                setTimeout(() => { badgeElement.style.transform = 'scale(1)'; }, 150);
            }
            const btnElement = document.getElementById('modal-vote-btn');
            if (btnElement) {
                btnElement.style.transform = 'scale(0.95)';
                setTimeout(() => { btnElement.style.transform = 'scale(1)'; }, 150);
            }
            
            // Optimistic update
            state.hasVotedFor = null;
            if (state.votes[optionId]) {
                state.votes[optionId] = state.votes[optionId].filter(v => v.userId !== state.user.id);
            }
            updateCardsVoteCounts();
            updateModalVoteBtn();

            const activityInfo = activitiesData.find(a => a.id === optionId);
            notifyTelegram(`🔴 <b>Vote Removed</b>\n${state.user.name} removed their vote for: ${activityInfo?.title || 'an activity'}`);

            const { error } = await supabase
                .from('votes')
                .delete()
                .eq('userId', state.user.id)
                .eq('pollId', state.pollId)
                .eq('optionId', optionId);

            if (error) {
                console.error("Unvote failed", error);
                fetchVotes(); // rollback if error occurs
            }
        } else {
            alert("You are only allowed one vote total! Click your current vote again to unvote it first.");
        }
        return;
    }
    
    // Voting Logic
    const btnElement = document.getElementById('modal-vote-btn');
    if (btnElement) {
        btnElement.style.transform = 'scale(0.95)';
        setTimeout(() => { btnElement.style.transform = 'scale(1)'; }, 150);
    }
    
    const badgeElement = document.getElementById(`badge-${optionId}`);
    if (badgeElement) {
        badgeElement.style.transform = 'scale(0.95)';
        setTimeout(() => { badgeElement.style.transform = 'scale(1)'; }, 150);
    }

    // Optimistic update
    state.hasVotedFor = optionId;
    if (!state.votes[optionId]) state.votes[optionId] = [];
    state.votes[optionId].push({
        userId: state.user.id,
        userName: state.user.name,
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(state.user.name)}&backgroundColor=transparent`
    });
    updateCardsVoteCounts();
    updateModalVoteBtn();

    const activityInfo = activitiesData.find(a => a.id === optionId);
    notifyTelegram(`✅ <b>New Vote!</b>\n${state.user.name} voted for: ${activityInfo?.title || 'an activity'}`);

    const { error } = await supabase.from('votes').insert([
        {
            userId: state.user.id,
            pollId: state.pollId,
            optionId,
            userName: state.user.name,
            userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(state.user.name)}&backgroundColor=transparent`,
            timestamp: new Date().toISOString()
        }
    ]);
    
    if (error) {
        if (error.code === '23505') {
            fetchVotes();
        } else {
            console.error("Vote failed", error);
            fetchVotes(); // rollback
        }
    }
}

// ------ SUGGESTIONS SYSTEM ------

function setupSuggestModal() {
    const openBtn = document.getElementById('open-suggest-btn');
    const closeBtn = document.getElementById('close-suggest-modal');
    const modal = document.getElementById('suggest-modal');
    const overlay = document.getElementById('suggest-overlay');
    const submitBtn = document.getElementById('submit-suggest-btn');
    
    if(!openBtn) return; // safety
    
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        overlay.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
    });
    
    overlay.addEventListener('click', () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
    });
    
    submitBtn.addEventListener('click', async () => {
        const titleEl = document.getElementById('suggest-title');
        const vibeEl = document.getElementById('suggest-vibe');
        const priceEl = document.getElementById('suggest-price');
        const mediaEl = document.getElementById('suggest-media');
        const status = document.getElementById('suggest-status');
        
        const title = titleEl.value.trim();
        const vibe = vibeEl.value.trim();
        const priceInfo = priceEl.value.trim();
        const image = mediaEl.value.trim();
        
        if (!title || !vibe || !priceInfo) {
            status.textContent = 'Please fill out title, vibe, and price!';
            return;
        }
        
        submitBtn.disabled = true;
        status.textContent = 'Submitting...';
        status.style.color = 'var(--text-light)';
        
        const { error } = await supabase.from('suggestions').insert([
            {
                title, 
                vibe, 
                priceInfo, 
                image, 
                userId: state.user.id,
                userName: state.user.name,
                timestamp: new Date().toISOString()
            }
        ]);
        
        submitBtn.disabled = false;
        
        if (error) {
            status.textContent = 'Failed to submit. Check permissions/connection.';
            status.style.color = 'var(--danger)';
            console.error("Suggestion error:", error);
        } else {
            // Success
            notifyTelegram(`💡 <b>New Suggestion Alert!</b>\n<b>${state.user.name}</b> suggested a place: <b>${title}</b>\n\n<i>"${vibe}"</i>\n💰 ${priceInfo}`);
            
            titleEl.value = '';
            vibeEl.value = '';
            priceEl.value = '';
            mediaEl.value = '';
            status.textContent = '';
            
            modal.classList.remove('active');
            overlay.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            // Optimistic render wait handled by realtime sub
        }
    });
}

function processSuggestionIntoActivity(s) {
    return {
        id: s.id, // we map their db UUID to the poll optionId seamlessly!
        title: s.title,
        vibe: s.vibe,
        priceInfo: s.priceInfo,
        image: s.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(s.title)}&backgroundColor=1a1a1a`,
        suggestedBy: s.userName,
        points: [s.vibe, `Price: ${s.priceInfo}`],
        video: '' 
    };
}

async function listenToSuggestions() {
    // Initial fetch
    const { data: suggestions, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('timestamp', { ascending: true });
        
    if (!error && suggestions) {
        suggestions.forEach(s => {
            if(!activitiesData.find(a => a.id === s.id)) {
                activitiesData.push(processSuggestionIntoActivity(s));
            }
        });
        renderCards();
    }
    
    // Subscribe to realtime database changes for suggestions
    supabase
        .channel('suggestions-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suggestions' }, payload => {
            if(!activitiesData.find(a => a.id === payload.new.id)) {
                activitiesData.push(processSuggestionIntoActivity(payload.new));
                renderCards();
                // Ensure vote fetch handles new DOM elements
                fetchVotes();
            }
        })
        .subscribe();
}

// ------ COMMENTS SYSTEM ------

function setupComments() {
    const input = document.getElementById('comment-input');
    const submitBtn = document.getElementById('submit-comment');

    submitBtn.addEventListener('click', submitComment);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitComment();
    });
}

async function fetchComments() {
    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
    if (error) {
        console.error("Error fetching comments", error);
        return;
    }
    
    state.comments = comments || [];
    renderComments();
}

function listenToComments() {
    fetchComments();
    
    // Subscribe to realtime database changes for comments
    supabase
        .channel('comments-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, payload => {
            state.comments.unshift(payload.new);
            // Re-sort descending based on timestamp
            state.comments.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            renderComments();
        })
        .subscribe();
}

function renderComments() {
    const list = document.getElementById('comments-list');
    list.innerHTML = '';
    
    if (state.comments.length === 0) {
         list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 20px;">No comments yet. Be the first!</p>';
         return;
    }

    state.comments.forEach(c => {
        const isOwn = c.userId === state.user.id;
        const el = document.createElement('div');
        el.className = `comment ${isOwn ? 'own' : ''}`;
        
        let timeString = '';
        if(c.timestamp) {
            const date = new Date(c.timestamp);
            timeString = getRelativeTime(date);
        } else {
            timeString = 'just now';
        }

        el.innerHTML = `
            <img src="${c.avatar}" alt="${escapeHtml(c.name)}" class="comment-avatar" style="border-color: ${c.color};">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-name" style="${isOwn ? `color: ${c.color}` : ''}">${escapeHtml(c.name)}</span>
                    <span class="comment-time">${timeString}</span>
                </div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
            </div>
        `;
        list.appendChild(el);
    });
}

let lastCommentTime = 0;
async function submitComment() {
    const input = document.getElementById('comment-input');
    const status = document.getElementById('comment-status');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Spam prevention (3 seconds)
    const now = Date.now();
    if (now - lastCommentTime < 3000) {
        status.textContent = 'Please wait a moment before sending again.';
        status.classList.add('show');
        setTimeout(() => status.classList.remove('show'), 2000);
        return;
    }
    
    lastCommentTime = now;
    input.value = '';
    
    const { error } = await supabase.from('comments').insert([
        {
            userId: state.user.id,
            name: state.user.name,
            avatar: state.user.avatar,
            color: state.user.color,
            text,
            timestamp: new Date().toISOString()
        }
    ]);
    
    if (error) {
        console.error("Comment failed", error);
    } else {
        notifyTelegram(`💬 <b>New Comment</b>\n<b>${state.user.name}</b> says:\n"<i>${text}</i>"`);
    }
}

// ------ UTILS ------

function getRelativeTime(date) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffMs = date.getTime() - Date.now();
    const diffMins = Math.round(diffMs / 60000);
    
    if (Math.abs(diffMins) < 1) return 'just now';
    if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
    
    const diffHours = Math.round(diffMins / 60);
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
    
    return rtf.format(Math.round(diffHours / 24), 'day');
}

function escapeHtml(unsafe) {
    if(!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

