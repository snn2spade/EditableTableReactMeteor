import 'antd/dist/antd.css';
import {Input, Form} from 'antd';
import React from 'react'
import PropTypes from 'prop-types';

const FormItem = Form.Item;

export default class TransactionEditableCell extends React.Component {
    static propTypes = {
        record: PropTypes.object,
        editable: PropTypes.bool,
        dataIndex: PropTypes.string,
        handleSaveCell: PropTypes.func,
        handleInsertBelow: PropTypes.func,
        handleDelete: PropTypes.func,
        nextFocusNo: PropTypes.number,
        nextFocusDataIndex: PropTypes.string,
        cleanNextFocus: PropTypes.func,
        setNextFocus: PropTypes.func,
        isEditing: PropTypes.bool
    };

    constructor(props) {
        // console.log("[TransactionEditableCell] constructor");
        // console.log(props);
        super(props);
        this.onPressEnter = this.onPressEnter.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.validateCell = this.validateCell.bind(this);
    }

    checkNextFocus() {
        if (this.props.record !== undefined && this.props.record.no === this.props.nextFocusNo && this.props.dataIndex === this.props.nextFocusDataIndex) {
            this.input.focus();
            this.props.cleanNextFocus();
        }
    }

    componentDidMount() {
        // console.log("[TransactionEditableCell] componentDidMount");
        this.checkNextFocus();
    }


    componentWillUnmount() {
        // console.log("[TransactionEditableCell] componentWillUnMount");
    }

    componentDidUpdate() {
        // console.log("[TransactionEditableCell] componentDidUpdate");
        this.checkNextFocus();
    }

    onPressEnter(event) {
        // console.log("[TransactionEditableCell] On Press Enter");
        this.props.handleInsertBelow(this.props.record.key)
    }

    onKeyDown(event) {
        const dataIndexList = ["date", "debit", "credit", "balance"];
        const index = dataIndexList.findIndex(item => this.props.dataIndex === item);
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.props.setNextFocus(this.props.record.no + 1, this.props.dataIndex);
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.props.setNextFocus(this.props.record.no - 1, this.props.dataIndex);
        }
        else if (event.key === "ArrowLeft" && event.target.selectionStart === 0 && index >= 1) {
            event.preventDefault();
            this.props.setNextFocus(this.props.record.no, dataIndexList[index - 1]);
        }
        else if (event.key === "ArrowRight" && event.target.selectionStart === event.target.value.length && index < dataIndexList.length - 1) {
            event.preventDefault();
            this.props.setNextFocus(this.props.record.no, dataIndexList[index + 1]);
        }
        else if (event.key === "Delete") {
            event.preventDefault();
            this.props.handleDelete(this.props.record.key);
        }
    }

    validateCell = (rule, value, callback) => {
        // console.log("[TransactionEditableCell] validate cell");
        const {record, handleSaveCell, dataIndex} = this.props;

        if (dataIndex === "date") {
            let date_match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (value === "") {
                console.log("Date Validate: Require date field.");
                callback("Require date field.");
                return
            }
            else if (!date_match) {
                console.log("Date Validate: Require format yyyy-mm-dd\"");
                callback("Require format yyyy-mm-dd");
                return
            }
            else if (date_match && parseInt(date_match[1]) > 2400) {
                console.log("Date Validate: Require (A.D) Year");
                callback("Require (A.D) Year");
                return
            }
            else if (date_match && parseInt(date_match[2]) > 12) {
                console.log("Date Validate: Month must be {1,12}");
                callback("Month must be {1,12}");
                return
            }
            else if (date_match && parseInt(date_match[3]) > 31) {
                console.log("Date Validate: Date must be {1,31}");
                callback("Date must be {1,31}");
                return
            }
            else {
                callback();
            }
        }
        else {
            let money_match = value.match(/^(\d*\.?\d+)$/);
            let helpText = "Require non-neg number xxxx.xx";
            if (dataIndex === "balance") {
                money_match = value.match(/^(\-?\d*\.?\d+)$/);
                helpText = "Require number xxxx.xx";
            }
            if (value !== "" && money_match) {
                // console.log("Money Validate: Success");
                callback();
            }
            else if (value === "") {
                // console.log("Money Validate: Success");
                callback();
            }
            else {
                console.log("Money Validate: ", helpText);
                callback(helpText);
                return
            }
        }
        handleSaveCell(record.key, dataIndex, value);
    };

    render() {
        const {
            editable,
            dataIndex,
            record,
            title,
            handleSaveCell,
            handleInsertBelow,
            handleDelete,
            nextFocusNo,
            nextFocusDataIndex,
            cleanNextFocus,
            setNextFocus,
            isEditing,
            form,
            ...restProps
        } = this.props;
        // if (record !== undefined) {
        //     console.log("Render cell key: ", record.key, " value: ", record[dataIndex], "form_value:", form.getFieldValue(`[${record.key}]` + `[${dataIndex}]`));
        // }
        return (
            <td ref={node => (this.cell = node)} {...restProps}>
                {editable ?
                    <FormItem style={{margin: 0}}>
                        {form.getFieldDecorator(`[${record.key}]` + `[${dataIndex}]`, {
                            rules: [{
                                validator: this.validateCell,
                            }],
                            initialValue: record[dataIndex],
                        })(
                            <Input
                                ref={node => (this.input = node)}
                                onPressEnter={this.onPressEnter}
                                disabled={!this.props.isEditing}
                                onKeyDown={this.onKeyDown}
                                autoComplete={"off"}
                            />)}
                    </FormItem>
                    : restProps.children}
            </td>
        );
    }
}