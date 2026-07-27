package com.example.handler;

import lombok.Data;
import java.util.Date;

@Data
public class ApiErrorDetails<E> {
    private String hostName;
    private String path;
    private Date createTime;
    private E message;
}