package models

type User struct {
  ID       int    `json:"id"`
  Username string `json:"username"`
  Email    string `json:"email"`
  Password []int  `json:"password"`
  IsAdmin  bool   `json:"is_admin"`
}
