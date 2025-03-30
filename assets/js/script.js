document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const API_KEY = "AIzaSyCQJ_TmDt3If3XGT2Wnr8EFGfRsVjMHzz8";
    let genAI, model;
    
    // Initialize Google Generative AI
    async function initializeAI() {
        try {
            // Load the Google Generative AI library
            const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
            genAI = new GoogleGenerativeAI(API_KEY);
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("AI model initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing AI:", error);
            return false;
        }
    }

    // Initialize AI when page loads
    initializeAI().then(success => {
        if (!success) {
            alert("Failed to initialize AI. Please check console for errors.");
        }
    });

    // DOM elements
    const analyzeBtn = document.getElementById('analyze-btn');
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const aiChatButton = document.getElementById('ai-chat-button');
    const aiChatModal = new bootstrap.Modal(document.getElementById('aiChatModal'));
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendMessageBtn = document.getElementById('send-message');
    const askAiButtons = document.querySelectorAll('.ask-ai');
    
    // Event listeners
    analyzeBtn.addEventListener('click', analyzeIdea);
    generatePlanBtn.addEventListener('click', generateBusinessPlan);
    aiChatButton.addEventListener('click', toggleChatModal);
    sendMessageBtn.addEventListener('click', sendMessage);
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Ask AI buttons
    askAiButtons.forEach(button => {
        button.addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            askAIForField(field);
        });
    });
    
    // Toggle chat modal
    function toggleChatModal() {
        aiChatModal.toggle();
    }
    
    // Send message to AI
    async function sendMessage() {
        const message = userMessageInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessageToChat(message, 'user');
        userMessageInput.value = '';
        
        // Show loading indicator
        const loadingId = addLoadingIndicator();
        
        try {
            // Check if model is initialized
            if (!model) {
                const initialized = await initializeAI();
                if (!initialized) {
                    throw new Error("AI model not initialized");
                }
            }
            
            // Generate AI response
            const result = await model.generateContent(message);
            const response = await result.response;
            const text = response.text();
            
            // Replace loading with AI response
            replaceLoadingWithResponse(loadingId, text, 'ai');
        } catch (error) {
            console.error('Error generating content:', error);
            replaceLoadingWithResponse(loadingId, "Sorry, I encountered an error. Please try again.", 'ai');
        }
    }
    
    // Analyze idea
    async function analyzeIdea() {
        const industry = document.getElementById('industry').value.trim();
        const region = document.getElementById('region').value.trim();
        const audience = document.getElementById('audience').value.trim();
        
        if (!industry || !region || !audience) {
            alert('Please fill in all fields before analyzing.');
            return;
        }
        
        // Show loading state
        analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...';
        
        try {
            // Check if model is initialized
            if (!model) {
                const initialized = await initializeAI();
                if (!initialized) {
                    throw new Error("AI model not initialized");
                }
            }
            
            // Generate PMF Analysis
            const pmfPrompt = `Generate a Product-Market Fit (PMF) analysis for a business in the ${industry} industry targeting ${audience} in ${region}. Include sections for Market Demand, Consumer Behavior, and Competitive Landscape. Format the response in markdown with clear headings and bullet points.`;
            const pmfResult = await model.generateContent(pmfPrompt);
            const pmfText = await pmfResult.response.text();
            document.getElementById('pmf-analysis').innerHTML = marked.parse(pmfText);
            
            // Generate Case Studies
            const caseStudyPrompt = `Provide 2-3 relevant case studies of successful businesses in the ${industry} industry targeting ${audience} in ${region}. For each case study, include the company name, key strategies, and lessons learned. Format the response in markdown with clear headings.`;
            const caseStudyResult = await model.generateContent(caseStudyPrompt);
            const caseStudyText = await caseStudyResult.response.text();
            document.getElementById('case-studies').innerHTML = marked.parse(caseStudyText);
            
            // Generate Evaluation
            const evaluationPrompt = `Evaluate the business idea of operating in ${industry} targeting ${audience} in ${region}. Provide a score out of 10 and detailed feedback on strengths, weaknesses, opportunities, and threats (SWOT analysis). Format the response in markdown with clear headings.`;
            const evaluationResult = await model.generateContent(evaluationPrompt);
            const evaluationText = await evaluationResult.response.text();
            document.getElementById('evaluation').innerHTML = marked.parse(evaluationText);
            
            // Show results and next section
            document.getElementById('analysis-results').classList.remove('d-none');
            document.getElementById('business-plan-section').classList.remove('d-none');
            
            // Scroll to results
            document.getElementById('analysis-results').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error analyzing idea:', error);
            alert('An error occurred while analyzing your idea. Please try again.');
        } finally {
            // Reset button
            analyzeBtn.textContent = 'Analyze my idea';
        }
    }
    
    // Generate business plan
    async function generateBusinessPlan() {
        const industry = document.getElementById('industry').value.trim();
        const region = document.getElementById('region').value.trim();
        const audience = document.getElementById('audience').value.trim();
        const businessModel = document.getElementById('business-model').value.trim();
        const productOffering = document.getElementById('product-offering').value.trim();
        const competitiveEdge = document.getElementById('competitive-edge').value.trim();
        const marketingApproach = document.getElementById('marketing-approach').value.trim();
        
        if (!businessModel || !productOffering || !competitiveEdge || !marketingApproach) {
            alert('Please fill in all business plan fields before generating.');
            return;
        }
        
        // Show loading state
        generatePlanBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
        
        try {
            // Check if model is initialized
            if (!model) {
                const initialized = await initializeAI();
                if (!initialized) {
                    throw new Error("AI model not initialized");
                }
            }
            
            // Generate business plan
            const planPrompt = `Create a comprehensive business plan for a ${industry} business targeting ${audience} in ${region}. The business model is ${businessModel}, product offering is ${productOffering}, competitive edge is ${competitiveEdge}, and marketing approach is ${marketingApproach}. 
            
            Structure the plan with the following sections:
            1. Executive Summary
            2. Market Analysis (Industry Overview, Target Audience, Competitive Landscape)
            3. Product & Service Offering
            4. Business Model & Revenue Strategy
            5. Competitive Edge & Unique Selling Proposition
            6. Marketing Strategy
            7. Financial Projections
            8. Expansion & Future Growth
            9. Conclusion & Next Steps
            
            Format the response in markdown with clear headings and subheadings. Include bullet points for lists and ensure the content is professional and detailed.`;
            
            const planResult = await model.generateContent(planPrompt);
            const planText = await planResult.response.text();
            document.getElementById('business-plan-content').innerHTML = marked.parse(planText);
            
            // Show results
            document.getElementById('business-plan-results').classList.remove('d-none');
            
            // Scroll to results
            document.getElementById('business-plan-results').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error generating business plan:', error);
            alert('An error occurred while generating your business plan. Please try again.');
        } finally {
            // Reset button
            generatePlanBtn.textContent = 'Generate business plan';
        }
    }
    
    // Ask AI for specific field
    async function askAIForField(field) {
        const fieldName = {
            'industry': 'Industry or Business Sector',
            'region': 'Target Market Region',
            'audience': 'Target Audience',
            'business-model': 'Business Model',
            'product-offering': 'Product Offering',
            'competitive-edge': 'Competitive Edge',
            'marketing-approach': 'Marketing Approach'
        }[field];
        
        // Show modal
        aiChatModal.show();
        
        // Clear chat
        chatMessages.innerHTML = '';
        
        // Add initial message
        const initialMessage = `I need help with the "${fieldName}" field. What should I consider when filling this out for my business idea?`;
        addMessageToChat(initialMessage, 'user');
        
        // Show loading indicator
        const loadingId = addLoadingIndicator();
        
        try {
            // Check if model is initialized
            if (!model) {
                const initialized = await initializeAI();
                if (!initialized) {
                    throw new Error("AI model not initialized");
                }
            }
            
            // Generate AI response
            const result = await model.generateContent(initialMessage);
            const response = await result.response;
            const text = response.text();
            
            // Replace loading with AI response
            replaceLoadingWithResponse(loadingId, text, 'ai');
        } catch (error) {
            console.error('Error generating content:', error);
            replaceLoadingWithResponse(loadingId, "Sorry, I encountered an error. Please try again.", 'ai');
        }
    }
    
    // Helper function to add message to chat
    function addMessageToChat(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }
    
    // Helper function to add loading indicator
    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading-dots';
        loadingDiv.id = 'loading-' + Date.now();
        loadingDiv.textContent = 'Thinking';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv.id;
    }
    
    // Helper function to replace loading with response
    function replaceLoadingWithResponse(loadingId, response, sender) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.classList.remove('loading-dots');
            loadingDiv.textContent = response;
            loadingDiv.className = `message ${sender}-message markdown-content`;
            loadingDiv.innerHTML = marked.parse(response);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});
