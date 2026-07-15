package com.smartpark.domain.lpr.client;
public interface LprClient { Recognition recognize(byte[] image,String contentType); record Recognition(String plateNumber,double confidence){} }
