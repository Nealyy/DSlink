// API配置
const API_KEY = 'sk-aibppdtsbhpmkmetxgpfydwwsdkyvlslgaojzqtqmfuawgzu';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 获取DOM元素
const englishNameInput = document.getElementById('englishName');
const generateBtn = document.getElementById('generateBtn');
const loadingElement = document.getElementById('loading');
const resultsElement = document.getElementById('results');

// 生成名字的主函数
async function generateNames() {
    const englishName = englishNameInput.value.trim();
    
    // 输入验证
    if (!englishName) {
        alert('请输入你的英文名！');
        return;
    }

    // 显示加载动画
    showLoading(true);
    clearResults();

    try {
        const requestBody = {
            model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
            messages: [
                {
                    role: "system",
                    content: `你是一位既懂中国文化又很有幽默感的起名专家。请按照以下步骤为用户起名：

1. 首先理解用户英文名的含义和特点
2. 基于这个含义，创造性地生成三个有趣的中文名字
3. 名字要求：
   - 要体现中国传统文化元素
   - 可以加入一些现代网络梗或流行文化元素
   - 名字要押韵或有趣
   - 寓意要积极向上
4. 解释要诙谐幽默，可以讲一个小故事或加入一些俏皮话

请严格按照以下JSON格式返回，不要有任何其他文字：
{
    "names": [
        {
            "chinese": "名字1",
            "meaning_cn": "有趣的中文解释1",
            "meaning_en": "Funny English explanation 1"
        },
        {
            "chinese": "名字2",
            "meaning_cn": "有趣的中文解释2",
            "meaning_en": "Funny English explanation 2"
        },
        {
            "chinese": "名字3",
            "meaning_cn": "有趣的中文解释3",
            "meaning_en": "Funny English explanation 3"
        }
    ]
}`
                },
                {
                    role: "user",
                    content: `请为英文名"${englishName}"生成三个有趣的中文名字，要融入英文名的含义，可以有梗，但不能太出格。只返回JSON格式。`
                }
            ],
            temperature: 0.5,  
            max_tokens: 1000   
        };

        console.log('发送请求...');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('收到响应...');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误:', errorText);
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API返回数据:', data);

        // 获取AI的回答
        const aiResponse = data.choices[0]?.message?.content;
        if (!aiResponse) {
            throw new Error('API返回的数据格式不正确');
        }

        console.log('AI回答:', aiResponse);

        // 尝试解析JSON
        try {
            // 提取JSON部分
            const jsonStr = aiResponse.match(/\{[\s\S]*\}/)?.[0] || aiResponse;
            console.log('提取的JSON:', jsonStr);
            
            const result = JSON.parse(jsonStr);
            
            if (!result.names || !Array.isArray(result.names)) {
                throw new Error('数据格式不正确');
            }

            // 显示结果
            displayResults(result.names);
            
        } catch (error) {
            console.error('解析错误:', error);
            throw new Error('无法解析AI返回的数据，请重试');
        }

    } catch (error) {
        console.error('Error:', error);
        let errorMessage = '生成名字时出现错误:\n';
        
        if (error.message === 'Failed to fetch') {
            errorMessage += `
1. 请检查网络连接是否正常
2. 请确认是否能访问 ${API_URL}
3. 可能是跨域问题，请使用浏览器插件禁用CORS限制`;
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        showLoading(false);
    }
}

// 显示/隐藏加载动画
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
    generateBtn.disabled = show;
}

// 清空结果区域
function clearResults() {
    resultsElement.innerHTML = '';
    resultsElement.style.display = 'none';
}

// 显示结果
function displayResults(names) {
    resultsElement.style.display = 'flex';
    
    names.forEach(name => {
        const nameCard = document.createElement('div');
        nameCard.className = 'name-card';
        nameCard.innerHTML = `
            <div class="chinese-name">${name.chinese}</div>
            <div class="meaning">
                <h3>中文寓意：</h3>
                <p>${name.meaning_cn}</p>
            </div>
            <div class="meaning">
                <h3>English Meaning：</h3>
                <p>${name.meaning_en}</p>
            </div>
        `;
        resultsElement.appendChild(nameCard);
    });
}

// 添加回车键监听
englishNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateNames();
    }
});
