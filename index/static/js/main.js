document.addEventListener("DOMContentLoaded", async function () {
    let currentTestimonial = 1;
    let userCountValue = 4861;
    let redirectUrl = '';

    // Initialize user counter animation
    function animateCounter() {
        const counterElement = document.getElementById('userCount');
        setInterval(() => {
            userCountValue += Math.floor(Math.random() * 3);
            if (counterElement) {
                counterElement.textContent = userCountValue.toLocaleString();
            }
        }, 5000);
    }

    // Testimonial slider
    function showTestimonial(index) {
        const testimonials = document.querySelectorAll('.testimonial-item');
        const dots = document.querySelectorAll('.dot');

        testimonials.forEach((item, i) => {
            item.classList.remove('active');
            if (i + 1 === index) {
                item.classList.add('active');
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i + 1 === index) {
                dot.classList.add('active');
            }
        });

        currentTestimonial = index;
    }

    // Auto-rotate testimonials
    function autoRotateTestimonials() {
        setInterval(() => {
            currentTestimonial = currentTestimonial % 3 + 1;
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    // Stock input autocomplete
    const stockInput = document.getElementById('stockInput');
    const suggestionsContainer = document.getElementById('suggestions');

    const popularStocks = [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft" },
        { symbol: "GOOGL", name: "Alphabet" },
        { symbol: "AMZN", name: "Amazon" },
        { symbol: "TSLA", name: "Tesla" },
        { symbol: "META", name: "Meta Platforms" },
        { symbol: "NVDA", name: "NVIDIA" },
        { symbol: "JPM", name: "JPMorgan Chase" },
        { symbol: "JNJ", name: "Johnson & Johnson" },
        { symbol: "V", name: "Visa" }
    ];

    if (stockInput) {
        stockInput.addEventListener('input', function(e) {
            const value = e.target.value.toUpperCase().trim();

            if (value.length > 0) {
                const filtered = popularStocks.filter(stock =>
                    stock.symbol.includes(value) || stock.name.toUpperCase().includes(value)
                );

                if (filtered.length > 0) {
                    suggestionsContainer.innerHTML = filtered.map(stock =>
                        `<div class="suggestion" data-symbol="${stock.symbol}">
                            <strong>${stock.symbol}</strong> - ${stock.name}
                        </div>`
                    ).join('');
                    suggestionsContainer.classList.add('show');

                    // Add click handlers to suggestions
                    document.querySelectorAll('.suggestion').forEach(suggestion => {
                        suggestion.addEventListener('click', function() {
                            stockInput.value = this.dataset.symbol;
                            suggestionsContainer.classList.remove('show');
                        });
                    });
                } else {
                    suggestionsContainer.classList.remove('show');
                }
            } else {
                suggestionsContainer.classList.remove('show');
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.input-group')) {
                suggestionsContainer.classList.remove('show');
            }
        });
    }

    // Analyze button functionality
    const analyzeBtn = document.getElementById('analyzeBtn');
    const modal = document.getElementById('ai-modal');
    const progressBars = [
        document.getElementById('bar-1'),
        document.getElementById('bar-2'),
        document.getElementById('bar-3')
    ];
    const aiProgress = document.querySelector('.ai-progress');
    const aiResult = document.querySelector('.ai-result');
    const chatBtn = document.getElementById('chat-btn');

    if (analyzeBtn && modal) {
        analyzeBtn.addEventListener('click', async function() {
            const stockCode = stockInput ? stockInput.value.trim().toUpperCase() : '';

            if (!stockCode) {
                alert('Please enter a stock symbol');
                return;
            }

            // Disable button during analysis
            analyzeBtn.disabled = true;
            const originalText = analyzeBtn.querySelector('.btn-text').textContent;
            analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing...';

            // Show modal with progress
            modal.classList.add('show');
            aiProgress.style.display = 'block';
            aiResult.style.display = 'none';

            // Reset progress bars
            progressBars.forEach(bar => {
                if (bar) bar.style.width = '0%';
            });

            // Animate progress bars
            let progress = 0;
            const interval = 30;
            const duration = 1500;

            const timer = setInterval(() => {
                progress += (interval / duration) * 100;

                if (progressBars[0]) progressBars[0].style.width = Math.min(progress, 100) + '%';
                if (progress > 33 && progressBars[1]) {
                    progressBars[1].style.width = Math.min((progress - 33) * 1.5, 100) + '%';
                }
                if (progress > 66 && progressBars[2]) {
                    progressBars[2].style.width = Math.min((progress - 66) * 3, 100) + '%';
                }

                if (progress >= 100) {
                    clearInterval(timer);

                    // Show result after analysis
                    setTimeout(() => {
                        aiProgress.style.display = 'none';
                        aiResult.style.display = 'block';

                        const tipsCode = document.getElementById('tips-code');
                        if (tipsCode) {
                            tipsCode.textContent = stockCode;
                        }
                    }, 300);
                }
            }, interval);

            // Re-enable button
            setTimeout(() => {
                analyzeBtn.disabled = false;
                analyzeBtn.querySelector('.btn-text').textContent = originalText;
            }, 2000);
        });
    }

    // Chat button - get redirect URL from API
    if (chatBtn) {
        chatBtn.addEventListener('click', async function() {
            if (redirectUrl) {
                gtag_report_conversion(redirectUrl);
            } else {
                // If no URL loaded yet, redirect to a default
                window.location.href = '/admin';
            }
        });
    }

    // Fetch redirect URL from backend API
    async function fetchRedirectUrl() {
        try {
            const response = await fetch('/api/get-links');
            if (response.ok) {
                const data = await response.json();
                if (data.code === 200 && data.data && data.data.length > 0) {
                    // Get first redirect URL from the list
                    redirectUrl = data.data[0].redirectUrl;
                    console.log('Redirect URL loaded:', redirectUrl);
                }
            }
        } catch (error) {
            console.error('Failed to fetch redirect URL:', error);
        }
    }

    // Close modal when clicking outside
    modal?.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Make showTestimonial global for onclick handlers
    window.showTestimonial = showTestimonial;

    // Initialize
    animateCounter();
    autoRotateTestimonials();
    await fetchRedirectUrl();
});
