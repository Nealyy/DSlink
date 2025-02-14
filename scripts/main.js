// 配置对象
const config = {
    API_KEY: 'sk-aibppdtsbhpmkmetxgpfydwwsdkyvlslgaojzqtqmfuawgzu', // API密钥
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
    // 检查是否是情人节（2月14日）
    const today = new Date();
    const isValentinesDay = today.getMonth() === 1 && today.getDate() === 14;
    
    // 彩蛋功能：当用户名为 Stardust 且是情人节时触发
    if (username === 'Stardust' && isValentinesDay) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #ff6b6b, #ff8787);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 90%;
            width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.5s ease-out, float 3s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        `;

        // 添加爱心背景
        const hearts = Array(5).fill().map(() => {
            const heart = document.createElement('div');
            heart.style.cssText = `
                position: absolute;
                width: 30px;
                height: 30px;
                background: rgba(255, 255, 255, 0.1);
                transform: rotate(45deg);
                animation: floatHeart ${3 + Math.random() * 2}s ease-in-out infinite;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
            `;
            heart.innerHTML = '❤️';
            return heart;
        });

        hearts.forEach(heart => content.appendChild(heart));

        content.innerHTML += `
            <div style="position: relative; z-index: 1;">
                <h2 style="
                    margin-bottom: 25px;
                    color: white;
                    font-size: 2em;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    font-weight: bold;
                ">🌟 情人节快乐！</h2>
                <p style="
                    margin-bottom: 30px;
                    font-size: 1.4em;
                    color: white;
                    line-height: 1.5;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                ">最爱你的大喵</p>
                <button style="
                    padding: 12px 30px;
                    background: white;
                    color: #ff6b6b;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1.1em;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transform: translateY(0);
                " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.15)'"
                  onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.1)'"
                >感谢</button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // 点击感谢按钮关闭弹窗并继续登录流程
        const button = content.querySelector('button');
        button.onclick = () => {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(modal);
                completeLogin(username);
            }, 300);
        };

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-30px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.9); }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes floatHeart {
                0%, 100% { transform: rotate(45deg) translateY(0); }
                50% { transform: rotate(45deg) translateY(-15px); }
            }
        `;
        document.head.appendChild(style);
    } else {
        completeLogin(username);
    }
}

// 完成登录流程的函数
function completeLogin(username) {
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
