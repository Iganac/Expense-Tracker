package com.expensetracker.backend.controller.dto;

import java.util.List;

public class SliceResponse<T> {

    private List<T> content;
    private boolean hasNext;
    private int number; // page index
    private int size;   // page size

    public SliceResponse() {
    }

    public SliceResponse(List<T> content, boolean hasNext, int number, int size) {
        this.content = content;
        this.hasNext = hasNext;
        this.number = number;
        this.size = size;
    }

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
