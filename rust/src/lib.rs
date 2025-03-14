extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

#[derive(Debug)]
enum Token {
    Number(f64),
    Operator(char),
    LeftParen,
    RightParen,
}

fn get_precedence(op: char) -> u8 {
    match op {
        '+' | '-' => 1,
        '*' | '/' => 2,
        _ => 0,
    }
}

fn tokenize(expr: &str) -> Result<Vec<Token>, JsValue> {
    let mut tokens = Vec::new();
    let mut num_str = String::new();

    for c in expr.chars() {
        match c {
            '0'..='9' | '.' => num_str.push(c),
            '(' => {
                if !num_str.is_empty() {
                    tokens.push(Token::Number(num_str.parse::<f64>()
                        .map_err(|_| JsValue::from_str("Invalid number"))?));
                    num_str.clear();
                }
                tokens.push(Token::LeftParen);
            },
            ')' => {
                if !num_str.is_empty() {
                    tokens.push(Token::Number(num_str.parse::<f64>()
                        .map_err(|_| JsValue::from_str("Invalid number"))?));
                    num_str.clear();
                }
                tokens.push(Token::RightParen);
            },
            '+' | '-' | '*' | '/' => {
                if !num_str.is_empty() {
                    tokens.push(Token::Number(num_str.parse::<f64>()
                        .map_err(|_| JsValue::from_str("Invalid number"))?));
                    num_str.clear();
                }
                tokens.push(Token::Operator(c));
            },
            ' ' => {
                if !num_str.is_empty() {
                    tokens.push(Token::Number(num_str.parse::<f64>()
                        .map_err(|_| JsValue::from_str("Invalid number"))?));
                    num_str.clear();
                }
            },
            _ => return Err(JsValue::from_str("Invalid character in expression")),
        }
    }

    if !num_str.is_empty() {
        tokens.push(Token::Number(num_str.parse::<f64>()
            .map_err(|_| JsValue::from_str("Invalid number"))?));
    }

    Ok(tokens)
}

fn evaluate_operation(op: char, b: f64, a: f64) -> Result<f64, JsValue> {
    Ok(match op {
        '+' => a + b,
        '-' => a - b,
        '*' => a * b,
        '/' => {
            if b == 0.0 {
                return Err(JsValue::from_str("Division by zero"));
            }
            a / b
        },
        _ => return Err(JsValue::from_str("Invalid operator")),
    })
}

fn evaluate(tokens: Vec<Token>) -> Result<f64, JsValue> {
    let mut numbers = Vec::new();
    let mut operators = Vec::new();

    for token in tokens {
        match token {
            Token::Number(num) => numbers.push(num),
            Token::Operator(op) => {
                while let Some(&last_op) = operators.last() {
                    if last_op == '(' || get_precedence(op) > get_precedence(last_op) {
                        break;
                    }
                    let b = numbers.pop().ok_or_else(|| JsValue::from_str("Invalid expression"))?;
                    let a = numbers.pop().ok_or_else(|| JsValue::from_str("Invalid expression"))?;
                    numbers.push(evaluate_operation(operators.pop().unwrap(), b, a)?);
                }
                operators.push(op);
            },
            Token::LeftParen => operators.push('('),
            Token::RightParen => {
                while let Some(op) = operators.pop() {
                    if op == '(' {
                        break;
                    }
                    let b = numbers.pop().ok_or_else(|| JsValue::from_str("Invalid expression"))?;
                    let a = numbers.pop().ok_or_else(|| JsValue::from_str("Invalid expression"))?;
                    numbers.push(evaluate_operation(op, b, a)?);
                }
            },
        }
    }

    while let Some(op) = operators.pop() {
        if op == '(' {
            return Err(JsValue::from_str("Mismatched parentheses"));
        }
        let b = numbers.pop().ok_or_else(|| JsValue::from_str("Invalid expression"))?;
        let a = numbers.pop().ok_or_else(|| JsValue::from_str("Invalid expression"))?;
        numbers.push(evaluate_operation(op, b, a)?);
    }

    numbers.pop().ok_or_else(|| JsValue::from_str("Empty expression"))
}

#[wasm_bindgen]
pub fn calculate(expression: &str) -> Result<f64, JsValue> {
    let tokens = tokenize(expression)?;
    evaluate(tokens)
}
