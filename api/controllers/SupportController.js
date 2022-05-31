module.exports = {
  create: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const create = {
        title: req.body.title,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
      };

      if (!create.title) {
        return res.json({
          success: false,
          message: "ko tìm thấy title",
        });
      }

      if (create.createdBy) {
        const data = await User.findOne({
          isDeleted: { "!=": true },
          id: create.createdBy,
          //isDeleted : false,
        });
        if (!data) {
          return res.json({
            success: false,
            message: "ko tìm thấy createBy",
          });
        }
      }

      const createSupport = await Support.create(create).fetch();
      if (!createSupport || createSupport === null || createSupport === "") {
        return res.json({
          success: false,
          message: "tạo ko thành công",
        });
      } else {
        await Promise.all(
          req.body.data.map(async (element) => {
            if (!element.content) {
              return res.json({
                success: false,
                message: "ko tìm thấy content",
              });
            }

            const createSupportContent = await SupportContent.create({
              supportID: createSupport.id,
              content: element.content,
              createdBy: create.createdBy,
            }).fetch();

            if (
              !createSupportContent ||
              createSupportContent === null ||
              createSupportContent === ""
            ) {
              return res.json({
                success: false,
                message: "tạo content ko thành công",
              });
            } else {
              if (element.list_Image.length > 0) {
                for (let i = 0; i < element.list_Image.length; i++) {
                  await SupportImage.create({
                    supportID: createSupport.id,
                    contentID: createSupportContent.id,
                    url_img: element.list_Image[i].url_img,
                    createdBy: create.createdBy,
                  }).fetch();
                }
              }
            }
          })
        );

        const result = await SupportContent.find({
          isDeleted: { "!=": true },
          supportID: createSupport.id,
          isDeleted: false,
        }).populate("support_img", {
          where: {
            isDeleted: false,
          },
        });

        return res.json({
          success: true,
          Support: createSupport,
          Content: result,
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
  update: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const update = {
        id: req.body.id,
        title: req.body.title,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
      };
      const chkId = await Support.findOne({
        isDeleted: { "!=": true },
        id: update.id,
        isDeleted: false,
      });
      if (!chkId) {
        return res.json({
          success: false,
          message: "ko tìm thấy id",
        });
      }
      if (update.updatedBy) {
        const data = await User.findOne({
          isDeleted: { "!=": true },
          id: update.updatedBy,
        });
        if (!data) {
          return res.json({
            success: false,
            message: "ko tìm thấy updatedBy",
          });
        }
      }

      await Promise.all(
        req.body.data.map(async (element) => {
          if (element.content) {
            let create = await SupportContent.create({
              supportID: update.id,
              content: element.content,
              createdBy: update.updatedBy,
            }).fetch();
            if (!create || create === null || create === "") {
              return res.json({
                success: false,
                message: "tạo content ko thành công",
              });
            } else {
              if (element.list_Image.length > 0) {
                for (let i = 0; i < element.list_Image.length; i++) {
                  const _data = await SupportImage.create({
                    supportID: update.id,
                    contentID: create.id,
                    url_img: element.list_Image[i].url_img,
                    createdBy: update.updatedBy,
                  }).fetch();
                }
              }
            }
          }
        })
      );
      const result = await SupportContent.find({
        isDeleted: { "!=": true },
        supportID: update.id,
        isDeleted: false,
      }).populate("support_img", {
        where: {
          isDeleted: false,
        },
      });

      const UpdateSupport = await Support.updateOne({
        isDeleted: { "!=": true },
        id: update.id,
        isDeleted: false,
      }).set({
        title: update.title,
        // content:update.content,
        updatedBy: update.updatedBy,
      });
      if (!UpdateSupport || UpdateSupport === null || UpdateSupport === "") {
        return res.json({
          success: false,
          message: "cập nhập ko thành công",
        });
      } else {
        return res.json({
          success: true,
          data: UpdateSupport,
          create: result,
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
  deleted: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    if (!req.query.userid) {
      console.log("Empty req.query.userid");
      return res.badRequest(Utils.jsonErr("Empty userid"));
    }
    try {
      const deleted = {
        id: req.body.id,
        deletedBy: req.body.deletedBy,
      };
      const chkId = await Support.findOne({
        isDeleted: { "!=": true },
        id: deleted.id,
        isDeleted: false,
      });
      if (!chkId) {
        return res.json({
          success: false,
          message: "ko tìm thấy id",
        });
      }
      if (deleted.deletedBy) {
        const data = await User.findOne({
          isDeleted: { "!=": true },
          id: deleted.deletedBy,
        });
        if (!data) {
          return res.json({
            success: false,
            message: "ko tìm thấy deletedBy",
          });
        }
      }
      const DeletedSupport = await Support.updateOne({
        isDeleted: { "!=": true },
        id: deleted.id,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deleted.deletedBy,
      });
      if (!DeletedSupport || DeletedSupport === null || DeletedSupport === "") {
        return res.json({
          success: false,
          message: "xóa ko thành công",
        });
      } else {
        await Promise.all([
          await SupportImage.update({
            isDeleted: { "!=": true },
            supportID: deleted.id,
            isDeleted: false,
          }).set({
            isDeleted: true,
            deletedBy: deleted.deletedBy,
            deletedAt: Date.now(),
          }),
          await SupportContent.update({
            isDeleted: { "!=": true },
            supportID: deleted.id,
            isDeleted: false,
          }).set({
            isDeleted: true,
            deletedBy: deleted.deletedBy,
            deletedAt: Date.now(),
          }),
        ])
          // .then(function(data){
          //         return res.json({
          //             success: true,
          //             message: 'Đơn hàng đã được hủy thành công.',
          //         });
          // })
          .catch(function (data) {
            return res.json({
              success: false,
              message: "Hủy ảnh bị lỗi.",
            });
          });

        return res.json({
          success: true,
          success: "xóa thành công",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
  getSupportById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const id = req.body.id;
      if (!id) {
        return res.json({
          success: false,
          message: "ko tìm thấy id",
        });
      }
      const data = await Support.findOne({
        isDeleted: { "!=": true },
        id: id,
        isDeleted: false,
      });

      if (!data) {
        return res.json({
          success: false,
          message: "ko tìm thấy Support",
        });
      } else {
        const result = await SupportContent.find({
          isDeleted: { "!=": true },
          supportID: id,
          isDeleted: false,
        }).populate("support_img", {
          where: {
            isDeleted: false,
          },
        });

        return res.json({
          success: true,
          Support: data,
          Content: result,
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
  getAllSupport: async function (req, res) {
    try {
      const data = await Support.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      }).sort("createdAt DESC");

      if (!data) {
        return res.json({
          success: false,
          message: "ko tìm thấy data",
        });
      } else {
        const _result = [];
        await Promise.all(
          data.map(async (support) => {
            const result = await SupportContent.find({
              isDeleted: { "!=": true },
              supportID: support.id,
              isDeleted: false,
            }).populate("support_img", {
              where: {
                isDeleted: false,
              },
            });

            const set = {
              Support: support,
              Content: result,
            };

            _result.push(set);
          })
        );
        return res.json({
          success: true,
          // Result: data
          Result: _result,
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  uploadImage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const supportID = req.body.supportID;
      const contentID = req.body.contentID;
      const list_Image = req.body.list_Image;
      const createdBy = req.body.createdBy;

      if (!supportID) {
        return res.json({
          success: false,
          message: "Thiếu supportID",
        });
      } else {
        const checkSupport = await Support.findOne({
          isDeleted: { "!=": true },
          id: supportID,
          isDeleted: false,
        });

        if (!checkSupport) {
          return res.json({
            success: false,
            message: "SupportID không tồn tại.",
          });
        }
      }

      if (!contentID) {
        return res.json({
          success: false,
          message: "Thiếu contentID",
        });
      } else {
        const checkSupportContent = await SupportContent.findOne({
          isDeleted: { "!=": true },
          id: contentID,
          isDeleted: false,
        });

        if (!checkSupportContent) {
          return res.json({
            success: false,
            message: "contentID không tồn tại.",
          });
        }
      }

      if (list_Image.length > 0) {
        for (let i = 0; i < list_Image.length; i++) {
          await SupportImage.create({
            supportID: supportID,
            contentID: contentID,
            url_img: list_Image[i].url_img,
            createdBy: createdBy,
          }).fetch();
        }

        const data = await Support.findOne({
          isDeleted: { "!=": true },
          id: supportID,
          isDeleted: false,
        });

        const result = await SupportContent.find({
          isDeleted: { "!=": true },
          supportID: supportID,
          isDeleted: false,
        }).populate("support_img", {
          where: {
            isDeleted: false,
          },
        });

        return res.json({
          success: true,
          message: "Upload ảnh thành công.",
          Support: data,
          Content: result,
        });
      } else {
        return res.json({
          success: false,
          message: "Không có ảnh nào.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  removeImage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const list_Image = req.body.list_Image;
      const deletedBy = req.body.deletedBy;

      if (list_Image.length > 0) {
        for (let i = 0; i < list_Image.length; i++) {
          await Promise.all([
            await SupportImage.update({
              isDeleted: { "!=": true },
              id: list_Image[i].id,
              isDeleted: false,
            }).set({
              isDeleted: true,
              deletedBy: deletedBy,
              deletedAt: Date.now(),
            }),
          ])
            // .then(function(data){
            //         return res.json({
            //             success: true,
            //             message: 'Đơn hàng đã được hủy thành công.',
            //         });
            // })
            .catch(function (data) {
              return res.json({
                success: false,
                message: "Hủy ảnh bị lỗi.",
              });
            });
        }

        return res.json({
          success: true,
          message: "Hủy ảnh thành công.",
        });
      } else {
        return res.json({
          success: false,
          message: "Không có ảnh nào.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  updateContent: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      // const supportID = req.body.supportID;
      const list_Content = req.body.list_Content;
      const updatedBy = req.body.updatedBy;

      await Promise.all(
        list_Content.map(async (_element) => {
          let update = await SupportContent.updateOne({
            isDeleted: { "!=": true },
            id: _element.id,
            isDeleted: false,
          }).set({
            content: _element.content,
            updatedBy: updatedBy,
          });
        })
      )
        // .then(function(data){
        //         return res.json({
        //             success: true,
        //             message: 'Cập nhật thành công.',
        //         });
        // })
        .catch(function (data) {
          return res.json({
            success: false,
            message: "Cập nhật không thành công.",
          });
        });

      return res.json({
        success: true,
        message: "Cập nhật thành công.",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  deletedContent: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const deleted = {
        id: req.body.id,
        deletedBy: req.body.deletedBy,
      };
      const chkId = await SupportContent.findOne({
        isDeleted: { "!=": true },
        id: deleted.id,
        isDeleted: false,
      });
      if (!chkId) {
        return res.json({
          success: false,
          message: "ko tìm thấy id",
        });
      }
      if (deleted.deletedBy) {
        const data = await User.findOne({
          isDeleted: { "!=": true },
          id: deleted.deletedBy,
        });
        if (!data) {
          return res.json({
            success: false,
            message: "ko tìm thấy deletedBy",
          });
        }
      }
      const DeletedSupport = await SupportContent.updateOne({
        isDeleted: { "!=": true },
        id: deleted.id,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deleted.deletedBy,
      });
      if (!DeletedSupport || DeletedSupport === null || DeletedSupport === "") {
        return res.json({
          success: false,
          message: "xóa ko thành công",
        });
      } else {
        await Promise.all([
          await SupportImage.update({
            isDeleted: { "!=": true },
            contentID: deleted.id,
            isDeleted: false,
          }).set({
            isDeleted: true,
            deletedBy: deleted.deletedBy,
            deletedAt: Date.now(),
          }),
        ])
          // .then(function(data){
          //         return res.json({
          //             success: true,
          //             message: 'Đơn hàng đã được hủy thành công.',
          //         });
          // })
          .catch(function (data) {
            return res.json({
              success: false,
              message: "Hủy ảnh bị lỗi.",
            });
          });

        return res.json({
          success: true,
          success: "xóa thành công",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
};
