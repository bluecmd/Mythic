import React, {useEffect} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MythicTextField from '../../MythicComponents/MythicTextField';
import DeleteIcon from '@material-ui/icons/Delete';
import {IconButton, Input, Button, MenuItem} from '@material-ui/core';
import {muiTheme} from '../../../themes/Themes';
import AddCircleIcon from '@material-ui/icons/AddCircle';

export function CreatePayloadParameter(props){
    const [value, setValue] = React.useState("");
    const [dictValue, setDictValue] = React.useState([]);
    const [dictOptions, setDictOptions] = React.useState([]);
    const [dictSelectOptions, setDictSelectOptions] = React.useState([]);
    const [dictSelectOptionsChoice, setDictSelectOptionsChoice] = React.useState("");
    const [chooseOptions, setChooseOptions] = React.useState([]);
    const submitDictChange = (list) => {
        const condensed = list.map( (opt) => {
            return {[opt.key]: opt.value};
        });
        props.onChange(props.name, condensed, false);
    }
    useEffect( () => {
        if(props.parameter_type === "ChooseOne"){
            if(props.default_value){
                const options = props.default_value.split("\n");
                if( value === null){
                    setValue(options[0]);
                }
                setChooseOptions(options);
            }else{
                const options = props.parameter.split("\n");
                if( value === null){
                    setValue(options[0]);
                }
                setChooseOptions(options)
            }
        }else if(props.parameter_type === "Dictionary"){
            const options = JSON.parse(props.default_value);
            setDictOptions(options);
            console.log(options);
            let initial = options.reduce( (prev, op) => {
                // find all the options that have a default_show of true
                if(op.default_show){
                    return [...prev, {...op, value: op.default_value, key: op.name === "*" ? "": op.name} ];
                }else{
                    return [...prev];
                }
            }, [] );
            submitDictChange(initial);
            setDictValue(initial);
            let dictSelectOptionsInitial = options.reduce( (prev, op) => {
                //for each option, check how many instances of it are allowed
                // then check how many we have currently
                const count = initial.reduce( (preCount, cur) => {
                    if(cur.name === op.name){return preCount + 1}
                    return preCount;
                }, 0);
                if(op.max === -1 || op.max > count){
                    return [...prev, {...op, value: op.default_value, key: op.name === "*" ? "": op.name} ];  
                }else{
                    return [...prev]
                }
            }, []);
            setDictSelectOptions(dictSelectOptionsInitial);
            if (dictSelectOptionsInitial.length > 0){
                setDictSelectOptionsChoice(dictSelectOptionsInitial[0]);
            }
            
        }else{
            setValue(props.default_value);
        }
    }, [props.default_value, props.parameter, props.parameter_type, value]);
    
    const onChangeValue = (evt) => {
        setValue(evt.target.value);
        props.onChange(props.name, evt.target.value, false);
    }
    const onChangeText = (name, value, error) => {
        setValue(value);
        props.onChange(props.name, value, error);
    }
    const testParameterValues = (curVal) => {
        if( props.required && props.verifier_regex !== ""){
            return !RegExp(props.verifier_regex).test(curVal);
        }else if(props.verifier_regex !== "" && curVal !== ""){
            return !RegExp(props.verifier_regex).test(curVal);
        }else{
            return false;
        }
    }
    const onChangeDictVal = (evt, opt) => {
        const updated = dictValue.map( (op, i) => {
            if(i === opt){
                return {...op, value: evt.target.value};
            }else{
                return {...op}
            }
        } );
        submitDictChange(updated);
        setDictValue(updated);
    }
    const onChangeDictKey = (evt, index) => {
        const updated = dictValue.map( (op, i) => {
            if(i === index){
                return {...op, key: evt.target.value};
            }else{
                return {...op}
            }
        } );
        submitDictChange(updated);
        setDictValue(updated);
    }
    const addDictValEntry = () => {
        // add the selected value to our dict array
        const choice = dictSelectOptionsChoice;
        setDictValue([...dictValue, choice]);
        // updated the dict array to the new set of options
        let dictSelectOptionsInitial = dictSelectOptions.reduce( (prev, op) => {
            //for each option, check how many instances of it are allowed
            // then check how many we have currently
            let count = dictValue.reduce( (preCount, cur) => {
                if(cur.name === op.name){return preCount + 1}
                return preCount;
            }, 0);
            if(choice.name === op.name){count += 1}
            console.log(op.max);
            if(op.max === -1 || op.max > count){
                return [...prev, {...op}];    
            }else{
                return [...prev]
            }
        }, []);
        submitDictChange(dictSelectOptionsInitial);
        setDictSelectOptions(dictSelectOptionsInitial);
        if (dictSelectOptionsInitial.length > 0){
            setDictSelectOptionsChoice(dictSelectOptionsInitial[0]);
        }
    }
    const removeDictEntry = (i) => {
        const choice = dictValue[i];
        const newValues = dictValue.filter( (opt, index) => {
            if(i === index){return false};
            return true;
        });
        setDictValue(newValues);
        // updated the dict array to the new set of options
        let dictSelectOptionsInitial = dictOptions.reduce( (prev, op) => {
            //for each option, check how many instances of it are allowed
            // then check how many we have currently
            let count = newValues.reduce( (preCount, cur) => {
                if(cur.name === op.name){return preCount + 1}
                return preCount;
            }, 0);
            if(choice.name === op.name){count -= 1}
            if(op.max === -1 || op.max > count){
                return [...prev, {...op, value: op.default_value, key: op.name === "*" ? "": op.name}];    
            }else{
                return [...prev]
            }
        }, []);
        submitDictChange(dictSelectOptionsInitial);
        setDictSelectOptions(dictSelectOptionsInitial);
        if (dictSelectOptionsInitial.length > 0){
            setDictSelectOptionsChoice(dictSelectOptionsInitial[0]);
        }
    }
    const getParameterObject = () => {
        switch(props.parameter_type){
            case "ChooseOne":
                return (
                    <FormControl>
                        <Select
                          native
                          value={value}
                          onChange={onChangeValue}
                        >
                        {
                            chooseOptions.map((opt, i) => (
                                <option key={"buildparamopt" + i} value={opt}>{opt}</option>
                            ))
                        }
                        </Select>
                    </FormControl>
                )
            case "Dictionary":
                return (
                    <React.Fragment>
                        {dictValue.map( (opt, i) => (
                            <div key={"dictval" + i}>
                                <IconButton onClick={(e) => {removeDictEntry(i)}}><DeleteIcon style={{color: muiTheme.palette.error.main}} /> </IconButton>
                                {opt.name === "*" ? 
                                    (
                                        <Input style={{width:"20%"}} startAdornment={<Button disabled>Key</Button>} size="small" value={opt.key} onChange={(e) => onChangeDictKey(e, i)}></Input>
                                    ) : (
                                        <Input variant="outlined" size="small" style={{width:"20%"}} startAdornment={<Button disabled>key</Button>} value={opt.key} ></Input>
                                    ) 
                                }
                                <Input style={{width:"75%"}} startAdornment={<Button disabled>value</Button>} size="small" value={opt.value} onChange={(e) => onChangeDictVal(e, i)}></Input>
                            </div>
                        )
                        )}
                        {dictSelectOptions.length > 0 ? (
                            <div>
                                <IconButton onClick={addDictValEntry}> <AddCircleIcon style={{color: muiTheme.palette.success.main}}  /> </IconButton>
                                <Select size="small" value={dictSelectOptionsChoice} onChange={(e) => setDictSelectOptionsChoice(e.target.value)}>
                                    {dictSelectOptions.map( (selectOpt, i) => (
                                        <MenuItem key={"selectopt" + props.name + "i"} value={selectOpt}>{selectOpt.name === "*" ? "Custom Key": selectOpt.name}</MenuItem>
                                    ) )}
                                </Select>
                                
                            </div>
                        ) : (null) 
                        }
                    </React.Fragment>
                )
            case "String":
                return (
                    <MythicTextField required={props.required} placeholder={props.default_value} value={value} multiline={true}
                        onChange={onChangeText} display="inline-block"
                        validate={testParameterValues} errorText={"Must match: " + props.verifier_regex}
                    />
                )
           default:
            return null
        }
    }
    
    return (
            <TableRow key={"buildparam" + props.id}>
                <TableCell>{props.description}
                 </TableCell>
                <TableCell>
                    {getParameterObject()}
                </TableCell>
            </TableRow>
        )
}

