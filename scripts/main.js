// 配置对象
const config = {
    API_KEY: '', // 在这里填入你的 API 密钥
    API_URL: 'https://api.siliconflow.cn/v1/chat/completions',  // API 地址
    AI_ROLE: `你是一名精通心理咨询的专家，拥有 20 年的心理咨询经验。你的任务是帮助一位不太懂心理咨询的打工人，排忧解难，纾解心理问题。你需要：
1. 以专业、温暖的态度倾听用户的心声
2. 运用专业的心理学知识和技巧提供建议
3. 保持同理心，理解用户的情感需求
4. 在必要时给出实用的建议和行动指导
5. 始终保持积极、正向的交流态度
6. 如果发现用户有严重的心理问题，建议其寻求线下专业心理医生的帮助

请记住：
- 每次回复都要体现专业性和同理心
- 避免过于简单或敷衍的回答
- 在合适的时候提供一些实用的心理学知识
- 保持对话的连贯性和温度`
};

// 如果存在本地配置，加载它
if (localStorage.getItem('api_key')) {
    config.API_KEY = localStorage.getItem('api_key');
}

// 检查是否设置了 API 密钥
function checkApiKey() {
    if (!config.API_KEY) {
        const key = prompt('请输入你的 SiliconFlow API 密钥：');
        if (key) {
            config.API_KEY = key;
            localStorage.setItem('api_key', key);
        }
    }
    return !!config.API_KEY;
}

// DOM 元素
const loginOverlay = document.getElementById('loginOverlay');
const appContainer = document.getElementById('appContainer');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');
const newChatButton = document.getElementById('newChat');
const historyList = document.getElementById('historyList');
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const currentUserSpan = document.getElementById('currentUser');
const switchUserButton = document.getElementById('switchUser');

// 当前用户状态
let currentUser = null;
let conversationHistory = [];
let currentConversationId = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否有已登录用户
    checkLoginStatus();
    
    // 登录按钮事件
    loginButton.addEventListener('click', handleLogin);
    
    // 切换用户按钮事件
    switchUserButton.addEventListener('click', handleSwitchUser);
    
    // 自动调整输入框高度
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
    });

    // 发送消息事件
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // 新对话按钮事件
    newChatButton.addEventListener('click', startNewChat);
});

// 检查登录状态
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        loginUser(savedUser);
    }
}

// 处理登录
function handleLogin() {
    const username = usernameInput.value.trim();
    if (username) {
        loginUser(username);
    }
}

// 登录用户
function loginUser(username) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
    
    // 更新UI
    currentUserSpan.textContent = `当前用户：${username}`;
    loginOverlay.style.display = 'none';
    appContainer.style.display = 'flex';
    
    // 加载用户的对话历史
    loadUserHistory();
    
    // 开始新对话
    startNewChat();
}

// 处理切换用户
function handleSwitchUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    conversationHistory = [];
    currentConversationId = null;
    
    // 清空输入
    usernameInput.value = '';
    
    // 更新UI
    loginOverlay.style.display = 'flex';
    appContainer.style.display = 'none';
    chatMessages.innerHTML = '';
    historyList.innerHTML = '';
}

// 加载用户历史记录
function loadUserHistory() {
    const userHistory = JSON.parse(localStorage.getItem(`${currentUser}_history`) || '[]');
    updateHistoryList(userHistory);
}

// 保存对话
function saveConversation(userMessage, aiResponse) {
    if (!currentUser) return;
    
    const conversation = {
        id: currentConversationId,
        timestamp: Date.now(),
        messages: [...conversationHistory]
    };
    
    let userHistory = JSON.parse(localStorage.getItem(`${currentUser}_history`) || '[]');
    const existingIndex = userHistory.findIndex(c => c.id === currentConversationId);
    
    if (existingIndex !== -1) {
        userHistory[existingIndex] = conversation;
    } else {
        userHistory.unshift(conversation);
    }
    
    localStorage.setItem(`${currentUser}_history`, JSON.stringify(userHistory));
    updateHistoryList(userHistory);
}

// 更新历史记录列表
function updateHistoryList(history) {
    historyList.innerHTML = '';
    history.forEach(conversation => {
        const date = new Date(conversation.timestamp);
        const listItem = document.createElement('div');
        listItem.className = 'history-item';
        
        // 创建时间显示
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = '删除此对话';
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            deleteConversation(conversation.id);
        };
        
        listItem.appendChild(timeSpan);
        listItem.appendChild(deleteBtn);
        listItem.onclick = () => loadConversation(conversation);
        
        if (conversation.id === currentConversationId) {
            listItem.classList.add('active');
        }
        
        historyList.appendChild(listItem);
    });
}

// 删除对话
function deleteConversation(conversationId) {
    if (!currentUser) return;
    
    // 获取当前用户的历史记录
    let userHistory = JSON.parse(localStorage.getItem(`${currentUser}_history`) || '[]');
    
    // 找到要删除的对话的索引
    const index = userHistory.findIndex(c => c.id === conversationId);
    
    if (index !== -1) {
        // 从数组中删除该对话
        userHistory.splice(index, 1);
        
        // 更新localStorage
        localStorage.setItem(`${currentUser}_history`, JSON.stringify(userHistory));
        
        // 如果删除的是当前对话，开始新对话
        if (conversationId === currentConversationId) {
            startNewChat();
        }
        
        // 更新历史记录列表
        updateHistoryList(userHistory);
    }
}

// 加载特定对话
function loadConversation(conversation) {
    currentConversationId = conversation.id;
    conversationHistory = [...conversation.messages];
    
    // 清空当前对话
    chatMessages.innerHTML = '';
    
    // 重新显示所有消息
    conversation.messages.forEach(msg => {
        appendMessage(msg.content, msg.role);
    });
}

// 开始新对话
function startNewChat() {
    currentConversationId = Date.now().toString();
    conversationHistory = [];
    chatMessages.innerHTML = '';
    
    // 显示欢迎消息
    appendMessage(`你好！我是你的AI心理咨询师。我有20年的心理咨询经验，很高兴能为你提供帮助。

在这里，你可以和我分享任何困扰你的问题，我会以专业、温暖的态度倾听你的心声，并提供专业的建议。

请记住，这是一个安全的对话空间，你说的每一句话都会被严格保密。

现在，告诉我你想聊些什么？`, 'assistant');
}

// 处理发送消息
async function handleSendMessage() {
    if (!checkApiKey()) {
        alert('请先设置 API 密钥');
        return;
    }
    
    if (!currentUser) return;
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // 禁用输入和发送按钮
    userInput.disabled = true;
    sendButton.disabled = true;
    
    try {
        // 清空输入框
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 显示用户消息
        appendMessage(message, 'user');
        
        // 显示AI思考状态
        showStatus('AI正在思考中...', 'thinking');
        
        // 获取AI回复
        const aiResponse = await getAIResponse(message);
        
        // 移除思考状态消息
        const thinkingMessage = chatMessages.querySelector('.message.system.thinking');
        if (thinkingMessage) {
            chatMessages.removeChild(thinkingMessage);
        }
        
        // 显示AI回复
        appendMessage(aiResponse, 'assistant');
        
        // 保存对话
        saveConversation(message, aiResponse);
        
    } catch (error) {
        console.error('Error:', error);
        
        // 移除思考状态消息
        const thinkingMessage = chatMessages.querySelector('.message.system.thinking');
        if (thinkingMessage) {
            chatMessages.removeChild(thinkingMessage);
        }
        
        // 显示错误消息
        showStatus(`错误：${error.message}`, 'error');
    } finally {
        // 恢复输入和发送按钮
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// 调用API获取AI回复
async function getAIResponse(message) {
    try {
        const response = await fetch(config.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
                messages: [
                    { role: "system", content: config.AI_ROLE },
                    ...conversationHistory,
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || '网络请求失败');
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0]) {
            throw new Error('API返回数据格式错误');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('无法获取AI回复，请稍后再试');
    }
}

// 显示状态消息
function showStatus(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `message system ${type}`;
    statusDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(statusDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加消息到聊天界面
function appendMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (role === 'reasoning') {
        messageContent.innerHTML = `
            <div class="reasoning-header">
                <span class="reasoning-icon">💭</span>
                <span>思考过程</span>
            </div>
            <div class="reasoning-content">${content.replace(/\n/g, '<br>')}</div>
        `;
    } else {
        messageContent.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // 平滑滚动到底部
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });

    // 只保存用户和助手的消息到历史记录
    if (role === 'user' || role === 'assistant') {
        conversationHistory.push({ role, content });
    }
}
