--[[
说明：进一步初始化页面对象
参数：
arglist 初始化也面对像的属性列表
格式： table
例子： { physicalkeyListeners = {"backspace",pageJump.backPage}}
]]--
function remodel_page(pageid, arglist)
    --属性赋值
    arglist = arglist or {};
    for key, value in pairs(arglist) do
        globalPages[pageid][key] = value;
    end;
end
