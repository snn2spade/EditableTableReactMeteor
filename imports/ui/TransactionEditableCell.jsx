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
        nextFocus: PropTypes.number,
        cleanNextFocus: PropTypes.func,
        isEditing: PropTypes.bool
    };

    constructor(props) {
        // console.log("[TransactionEditableCell] constructor");
        // console.log(props);
        super(props);
        this.onPressEnter = this.onPressEnter.bind(this);
        this.validateCell = this.validateCell.bind(this);
    }

    checkNextFocus() {
        if (this.props.record !== undefined && this.props.record.no === this.props.nextFocus && this.props.dataIndex === "date") {
            this.input.focus();
            this.props.cleanNextFocus();
        }
    }

    componentDidMount() {
        // console.log("[TransactionEditableCell] componentDidMount");
        // this.checkNextFocus();
    }


    componentWillUnmount() {
        // console.log("[TransactionEditableCell] componentWillUnMount");
    }

    componentDidUpdate() {
        // console.log("[TransactionEditableCell] componentDidUpdate");
        // this.checkNextFocus();
    }

    onPressEnter(event) {
        // console.log("[TransactionEditableCell] On Press Enter");
        this.props.handleInsertBelow(this.props.record.key)
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
            nextFocus,
            cleanNextFocus,
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
                            />)}
                    </FormItem>
                    : restProps.children}
            </td>
        );
    }
}