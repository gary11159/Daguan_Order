import React from 'react';

const Pure = () => {
    const componentRef = React.useRef();

    // 產生大量JSON
    // React.useEffect(() => {
    //     let jsonStr = '{"202011": {"1": {"address": "合歡山","dateTime": "2020/11/4", "money": "Free", "name": "蔣董", "other": "","phone": "09123", "sale": "葉冠秀"}';
    //     for (let i = 0; i < 3000; i++) {
    //         jsonStr += ',\"' + (i + 1) + '\": {"address": "合歡山","dateTime": "2020/11/4", "money": "Free", "name": "蔣董", "other": "","phone": "09123", "sale": "葉冠秀"}'
    //     }
    //     // let jsonStr = '{"20211": {"1": {"teamId":"1","status":"pending"}';
    //     // jsonStr += ',"2": {"teamId":"1","status":"pending"}'
    //     jsonStr += '}}'
    //     var obj = JSON.parse(jsonStr);
    //     console.log(jsonStr);
    // }, [])

    React.useEffect(() => {
        console.log(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
    }, [])
    return (
        <div>
            Test
        </div>
    );
};


export default Pure;