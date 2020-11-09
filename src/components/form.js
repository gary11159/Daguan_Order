import React from 'react';
import ReactToPrint from 'react-to-print';
import DatePicker from "react-datepicker";
import Pass from '../public/check.png';
import Fail from '../public/noti.png';
import Warn from '../public/warning.png';

function Form(props) {
    const [numberRecord, setNumberRecord] = React.useState();
    const [futureNumber, setFutureNumber] = React.useState(""); // 預開編號
    const [isPass, setIsPass] = React.useState('first');  //判斷編號是否使用過
    const [refreshCheck, setRefreshCheck] = React.useState(); // 判斷是否需要重新檢查編號
    const [chooseDate, setChooseDate] = React.useState();

    // 處理預開日期變動
    async function handlerDatePickerChange(date) {
        props.setLoadingStatus(true);
        setRefreshCheck(true);
        setIsPass(false);
        setChooseDate(date);
        if (props.from === "future") props.setChooseDate(date);
        if (date === undefined || date === null || date === '') return;
        const path = date.getFullYear() + "" + (date.getMonth() + 1);
        props.database.ref(path).once("value", e => {
            let data = e.val();
            if (data !== undefined && data !== null) {
                setNumberRecord(Object.keys(data));
            } else {
                setNumberRecord([]);
            }
            props.setLoadingStatus(false);
        });
    }

    // 處理預開編號input value
    function handlerFutureNumberChange(e) {
        setIsPass(false);
        if (refreshCheck !== true) setRefreshCheck(true);
        let value = e.target.value;
        const num = parseInt(value, 10);
        if (value === undefined || value === null || value === "" || isNaN(num)) {
            setFutureNumber("");
            return;
        }

        setFutureNumber(num);
    }

    // 檢查編號重複
    function checkNumber() {
        if (numberRecord.length === 0 && Number.isInteger(futureNumber)) {
            setIsPass(true);
            setRefreshCheck(false);
            props.setPrintNum(futureNumber);
            return false;
        }
        let bool = true;
        if (Number.isInteger(futureNumber)) {
            bool = numberRecord.some((item) => {
                return item == futureNumber;
            });
        }

        if (bool) {
            setIsPass(false);
        } else {
            setIsPass(true);
            props.setPrintNum(futureNumber);
        }
        setRefreshCheck(false);
    }

    // 轉換編號成正式格式
    function convertNum(num) {
        if (num === "") return "";
        if (props.from === "now") {
            if (num < 10) {
                return (new Date().getFullYear() - 1911) + "" + (new Date().getMonth() + 1) + '00' + num;
            } else if (num < 100) {
                return (new Date().getFullYear() - 1911) + "" + (new Date().getMonth() + 1) + '0' + num;
            } else {
                return (new Date().getFullYear() - 1911) + "" + (new Date().getMonth() + 1) + "" + num;
            }
        } else if (props.from === "future") {
            if (chooseDate === undefined || chooseDate === null || chooseDate === "" || num === "") return "";
            if (num < 10) {
                return (chooseDate.getFullYear() - 1911) + "" + (chooseDate.getMonth() + 1) + '00' + num;
            } else if (num < 100) {
                return (chooseDate.getFullYear() - 1911) + "" + (chooseDate.getMonth() + 1) + '0' + num;
            } else {
                return (chooseDate.getFullYear() - 1911) + "" + (chooseDate.getMonth() + 1) + "" + num;
            }
        } else if (props.from === "history") {
            if (props.historyChooseDate === undefined || props.historyChooseDate === null || props.historyChooseDate === "" || num === "") return "";
            if (num < 10) {
                return (props.historyChooseDate.getFullYear() - 1911) + "" + (props.historyChooseDate.getMonth() + 1) + '00' + num;
            } else if (num < 100) {
                return (props.historyChooseDate.getFullYear() - 1911) + "" + (props.historyChooseDate.getMonth() + 1) + '0' + num;
            } else {
                return (props.historyChooseDate.getFullYear() - 1911) + "" + (props.historyChooseDate.getMonth() + 1) + "" + num;
            }
        }
    }

    return (
        <>
            <div className="form">
                {props.from === 'future' &&
                    <>
                        <div className="row">
                            <div className="col-25">
                                <label htmlFor="fname">指定編號日期</label>
                            </div>
                            <div className="col-75">
                                <DatePicker
                                    placeholderText="請選擇日期"
                                    selected={chooseDate}
                                    onChange={date => handlerDatePickerChange(date)}
                                    dateFormat="yyyy年MM月"
                                    showDisabledMonthNavigation
                                    showMonthYearPicker
                                    locale={'ja'}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-25" />
                            {refreshCheck === true ?
                                <div className="col-75" style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                    <img src={Warn} style={{ width: '1.1em', marginRight: '15px' }} alt="warn"></img>
                                    <span style={{ color: ' #FFD764' }}>請檢查編號！</span>
                                </div> :
                                isPass === true ?
                                    <div className="col-75" style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                        <img src={Pass} style={{ width: '1.1em', marginRight: '15px' }} alt="success"></img>
                                        <span style={{ color: '#3AB54A' }}>此編號可以使用！</span>
                                    </div>
                                    :
                                    isPass === false &&
                                    <div className="col-75" style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                        <img src={Fail} style={{ width: '1.1em', marginRight: '15px' }} alt="fail"></img>
                                        <span style={{ color: '#E2574C' }}>此編號無法使用！</span>
                                    </div>
                            }
                        </div>
                    </>
                }
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="fname">編號</label>
                    </div>
                    <div className="col-75">
                        {(props.from === "now" || props.from === 'history') ?
                            <input type="text" id="number" name="number" readOnly="readonly" value={convertNum(props.number)} onChange={(e) => handlerFutureNumberChange(e)}></input>
                            :
                            <div className="row" className="elementAlignCenter">
                                <div className="col-85">
                                    <input type="text" id="number" name="number" value={futureNumber} onChange={(e) => handlerFutureNumberChange(e)}></input>
                                </div>
                                <div className="col-15">
                                    <button className="printButton" style={{ width: '80%' }} onClick={() => checkNumber()}>檢查</button>
                                </div>
                            </div>
                        }

                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="fname">日期</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="dateTime" name="dateTime" readOnly="readonly" value={props.dateTime} ></input>
                    </div>
                </div>

                <div className="row">
                    <div className="col-25">
                        <label htmlFor="lname">承辦業務</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="sale" name="sale" placeholder="請輸入業務" onChange={(e) => props.handleChange(e)} value={props.sale}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="lname">廠商</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="factory" name="factory" placeholder="請輸入廠商" onChange={(e) => props.handleChange(e)} value={props.factory}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="lname">客戶名稱</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="name" name="name" placeholder="請輸入客戶名稱" onChange={(e) => props.handleChange(e)} value={props.name}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="subject">客戶電話</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="phone" name="phone" placeholder="請輸入電話" onChange={(e) => props.handleChange(e)} value={props.phone}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="subject">施工時間</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="workTime" name="workTime" placeholder="請輸入施工時間" onChange={(e) => props.handleChange(e)} value={props.workTime}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="subject">施工地址</label>
                    </div>
                    <div className="col-75">
                        <textarea id="address" name="address" placeholder="請輸入地址" style={{ height: '100px' }} onChange={(e) => props.handleChange(e)} value={props.address}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="subject">金額</label>
                    </div>
                    <div className="col-75">
                        <input type="text" id="money" name="money" placeholder="請輸入金額" onChange={(e) => props.handleChange(e)} value={props.money}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="subject">備註</label>
                    </div>
                    <div className="col-75">
                        <textarea id="subotherject" name="other" placeholder="請輸入備註" style={{ height: '100px' }} onChange={(e) => props.handleChange(e)} value={props.other}></textarea>
                    </div>
                </div>
                <div className="row" style={{ marginTop: '20px' }}>
                    <ReactToPrint
                        onBeforePrint={(e) => {
                            props.saveData(e, chooseDate, futureNumber);
                            handlerDatePickerChange(chooseDate);
                        }}
                        trigger={() =>
                            props.from === 'history' ?
                                <button className={props.number !== undefined && props.number !== "" ? "printButton" : "printButton notAllow"}
                                    disabled={props.number !== undefined && props.number !== "" ? false : true}>儲存並列印</button>
                                : props.from === 'future' ?
                                    <button className={props.number !== undefined && props.number !== " " && isPass === true ? "printButton" : "printButton notAllow"}
                                        disabled={props.number !== undefined && props.number !== " " && isPass === true ? false : true}>儲存並列印</button>
                                    :
                                    <button className="printButton">儲存並列印</button>

                        }
                        content={() => props.componentRef.current}
                    />
                </div>
            </div>
        </>
    );
}

export default Form;
